/**
 * GET /api/analytics/popular-projects  — top project types by recommendation count
 * GET /api/analytics/popular-mcus      — most recommended MCUs
 * GET /api/analytics/prefs             — breakdown of budget/exp/conn preferences
 */

'use strict';

const { Router } = require('express');
const { getDb } = require('../db/database');

const router = Router();

router.get('/popular-projects', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT project_id, COUNT(*) AS count
    FROM recommendation_log
    GROUP BY project_id
    ORDER BY count DESC
    LIMIT 10
  `).all();
  res.json({ ok: true, data: rows });
});

router.get('/popular-mcus', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT mcu_picked, COUNT(*) AS count
    FROM recommendation_log
    GROUP BY mcu_picked
    ORDER BY count DESC
    LIMIT 10
  `).all();
  res.json({ ok: true, data: rows });
});

router.get('/prefs', (req, res) => {
  const db = getDb();
  const budget = db.prepare(`
    SELECT budget_pref AS value, COUNT(*) AS count
    FROM recommendation_log GROUP BY budget_pref ORDER BY count DESC
  `).all();
  const exp = db.prepare(`
    SELECT exp_pref AS value, COUNT(*) AS count
    FROM recommendation_log GROUP BY exp_pref ORDER BY count DESC
  `).all();
  const conn = db.prepare(`
    SELECT conn_pref AS value, COUNT(*) AS count
    FROM recommendation_log GROUP BY conn_pref ORDER BY count DESC
  `).all();
  const power = db.prepare(`
    SELECT power_pref AS value, COUNT(*) AS count
    FROM recommendation_log GROUP BY power_pref ORDER BY count DESC
  `).all();

  res.json({ ok: true, data: { budget, exp, conn, power } });
});

module.exports = router;
