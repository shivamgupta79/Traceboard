/**
 * recommender.js — server-side recommendation engine.
 * Mirrors the frontend scoreCandidate / pickMCU / pickConnectivity /
 * pickPower / buildRecommendation logic exactly so results are consistent
 * whether the client runs the wizard locally or hits the API.
 */

'use strict';

const { getDb } = require('../db/database');

// ── Helpers ────────────────────────────────────────────────────────────────

function parsePart(row) {
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    pros: JSON.parse(row.pros || '[]'),
    cons: JSON.parse(row.cons || '[]'),
  };
}

function allParts() {
  const db = getDb();
  return db.prepare('SELECT * FROM parts').all().map(parsePart);
}

function partById(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM parts WHERE id = ?').get(id);
  return row ? parsePart(row) : null;
}

function partsByCat(cat) {
  const db = getDb();
  return db.prepare('SELECT * FROM parts WHERE cat = ?').all(cat).map(parsePart);
}

function priceAvg(p) {
  return (p.price_min + p.price_max) / 2;
}

function priceStr(p) {
  if (p.price_min === 0 && p.price_max === 0) return 'Included';
  return `₹${p.price_min}–${p.price_max}`;
}

// ── Scoring ────────────────────────────────────────────────────────────────

function scoreCandidate(item, { conn, budget, exp }) {
  let score = 0;
  const needsRadio = (conn === 'wifi' || conn === 'ble');
  if (needsRadio) {
    if (item.tags.includes(conn)) score += 4;
  } else {
    if (item.tags.includes('none')) score += 3;
    if (item.tags.includes('wifi') || item.tags.includes('ble')) score += 1;
  }
  if (item.tags.includes(budget)) score += 2;
  if (item.tags.includes(exp))    score += 2;
  return score;
}

// ── Project → sensor role mapping ─────────────────────────────────────────

const PROJECT_SENSOR_ROLES = {
  home: [
    { role: 'Motion / presence sensing', best: 'pir',     alts: ['reed']   },
    { role: 'Climate sensing',            best: 'dht22',   alts: ['dht11']  },
    { role: 'Actuation / switching',      best: 'relay',   alts: ['servo']  },
  ],
  environment: [
    { role: 'Temperature & humidity',     best: 'dht22',   alts: ['dht11']  },
    { role: 'Air pressure / altitude',    best: 'bmp280',  alts: []         },
    { role: 'Air quality / gas',          best: 'mq135',   alts: ['rain']   },
  ],
  wearable: [
    { role: 'Heart rate & SpO2',          best: 'max30102', alts: []        },
    { role: 'Motion & orientation',       best: 'mpu6050', alts: []         },
    { role: 'Stress / skin response',     best: 'gsr',     alts: []         },
  ],
  agriculture: [
    { role: 'Soil moisture',              best: 'soilcap', alts: ['soilres']},
    { role: 'Climate sensing',            best: 'dht22',   alts: ['dht11'] },
    { role: 'Irrigation / nutrient',      best: 'flow',    alts: ['npk']   },
  ],
  security: [
    { role: 'Intrusion detection',        best: 'pir',     alts: ['reed']  },
    { role: 'Visual monitoring',          best: 'espcam',  alts: []        },
    { role: 'Access control',             best: 'rfid',    alts: []        },
  ],
  robotics: [
    { role: 'Obstacle detection',         best: 'ultrasonic', alts: ['irline'] },
    { role: 'Orientation sensing',        best: 'mpu6050',    alts: []         },
    { role: 'Actuation',                  best: 'servo',      alts: []         },
  ],
  energy: [
    { role: 'Current sensing',            best: 'acs712',  alts: []         },
    { role: 'Voltage sensing',            best: 'zmpt101b', alts: []        },
    { role: 'All-in-one metering',        best: 'pzem',    alts: []         },
  ],
};

// ── Pick functions ─────────────────────────────────────────────────────────

function pickMCU(state) {
  const mcus = partsByCat('mcu');
  const scored = mcus
    .map(m => ({ m, s: scoreCandidate(m, state) }))
    .sort((a, b) => b.s - a.s);
  return { best: scored[0].m, alts: scored.slice(1, 3).map(x => x.m) };
}

function pickConnectivity(state, mcu) {
  const modules = partsByCat('connectivity');
  const needsRadio = (state.conn === 'wifi' || state.conn === 'ble');

  if (needsRadio && mcu.tags.includes(state.conn)) {
    const builtinExtra = modules.filter(m => m.id === 'lora' || m.id === 'sim800l');
    return {
      builtin: true,
      best: {
        id: 'builtin',
        name: `Built into your ${mcu.name}`,
        price_min: 0, price_max: 0,
        desc: `Your chosen microcontroller already has ${state.conn === 'wifi' ? 'Wi-Fi' : 'BLE'} on-board — no extra module needed.`,
        pros: ['One less component to wire and power', 'One less thing that can fail'],
        cons: [],
        tags: [],
      },
      alts: builtinExtra,
    };
  }

  const wanted = state.conn === 'gsm' ? 'gsm' : 'lora';
  const scored = modules
    .map(m => ({ m, s: m.tags.includes(wanted) ? 3 : (m.tags.includes('mesh') ? 1 : 0) }))
    .sort((a, b) => b.s - a.s);
  return { builtin: false, best: scored[0].m, alts: scored.slice(1, 3).map(x => x.m) };
}

function pickPower(state, projectId) {
  const powerParts = partsByCat('power');
  const find = id => powerParts.find(p => p.id === id);

  let bestId, altIds;
  if (state.power === 'battery') {
    if (projectId === 'wearable') { bestId = 'lipo';    altIds = ['li18650']; }
    else                          { bestId = 'li18650'; altIds = ['lipo'];    }
  } else if (state.power === 'solar') {
    bestId = 'solar'; altIds = ['li18650'];
  } else {
    bestId = 'usb'; altIds = ['li18650'];
  }

  return { best: find(bestId), alts: altIds.map(find).filter(Boolean) };
}

// ── Main build function ────────────────────────────────────────────────────

function buildRecommendation(state) {
  const { project, conn, budget, exp, power } = state;
  const mcuPick  = pickMCU({ conn, budget, exp });
  const connPick = pickConnectivity({ conn, budget, exp }, mcuPick.best);
  const powerPick = pickPower({ power }, project);

  const roles = (PROJECT_SENSOR_ROLES[project] || []).map(r => ({
    role: r.role,
    best: partById(r.best),
    alts: r.alts.map(id => partById(id)).filter(Boolean),
  }));

  return { state, mcuPick, connPick, powerPick, roles };
}

// ── Cost calculation ───────────────────────────────────────────────────────

function calcTotal(selected) {
  let total = 0;
  const sum = arr => arr.forEach(p => { if (p) total += priceAvg(p); });
  sum(selected.mcuList    || []);
  sum(selected.connList   || []);
  sum(selected.components || []);
  sum(selected.powerList  || []);
  if (selected.regulator) total += priceAvg(selected.regulator);
  return total;
}

// ── Valid project IDs ──────────────────────────────────────────────────────
const VALID_PROJECTS = Object.keys(PROJECT_SENSOR_ROLES);

module.exports = {
  buildRecommendation,
  calcTotal,
  partById,
  allParts,
  partsByCat,
  priceAvg,
  priceStr,
  parsePart,
  VALID_PROJECTS,
  PROJECT_SENSOR_ROLES,
};
