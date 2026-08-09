/**
 * database.js — opens the SQLite database using Node.js built-in node:sqlite,
 * applies the schema, and seeds the parts catalogue on first run.
 *
 * Requires Node.js >= 22.5.0 (ships built-in, no native addon needed).
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const { DatabaseSync } = require('node:sqlite');
const { PARTS_SEED }   = require('./seed');

const DB_PATH     = path.join(__dirname, 'traceboard.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

function getDb() {
  if (db) return db;

  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  // Apply schema (idempotent — uses CREATE TABLE IF NOT EXISTS)
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);

  // Seed parts if table is empty
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM parts').get();
  if (n === 0) {
    console.log('[db] Seeding parts catalogue…');
    const insert = db.prepare(`
      INSERT OR IGNORE INTO parts
        (id, cat, name, price_min, price_max, tags, description, pros, cons, wiring_iface, wiring_pins)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of PARTS_SEED) {
      insert.run(
        p.id, p.cat, p.name, p.price_min, p.price_max,
        JSON.stringify(p.tags),
        p.description,
        JSON.stringify(p.pros),
        JSON.stringify(p.cons),
        p.wiring_iface ?? null,
        p.wiring_pins  ?? null,
      );
    }
    console.log(`[db] Seeded ${PARTS_SEED.length} parts.`);
  }

  return db;
}

module.exports = { getDb };
