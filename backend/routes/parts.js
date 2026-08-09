/**
 * GET  /api/parts           — full catalogue (optional ?cat=&q= filters)
 * GET  /api/parts/stats     — catalogue stats (counts per category)
 * GET  /api/parts/:id       — single part detail
 */

'use strict';

const { Router } = require('express');
const { getDb }  = require('../db/database');
const { parsePart } = require('../engine/recommender');

const router = Router();

// ── GET /api/parts ─────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const db = getDb();
  const { cat, q } = req.query;

  // Build query dynamically
  const conditions = [];
  const args = [];

  if (cat && cat !== 'all') {
    conditions.push('cat = ?');
    args.push(cat);
  }
  if (q) {
    const like = `%${String(q).toLowerCase()}%`;
    conditions.push('(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)');
    args.push(like, like);
  }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const sql   = `SELECT * FROM parts${where} ORDER BY cat, name`;

  const rows = db.prepare(sql).all(...args).map(parsePart);
  res.json({ ok: true, count: rows.length, data: rows });
});

// ── GET /api/parts/stats ────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const db    = getDb();
  const total = db.prepare('SELECT COUNT(*) AS n FROM parts').get().n;
  const byCat = db.prepare(
    'SELECT cat, COUNT(*) AS n FROM parts GROUP BY cat ORDER BY cat'
  ).all();
  res.json({ ok: true, data: { total, byCat } });
});

// ── GET /api/parts/:id ──────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const db  = getDb();
  const row = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'Part not found' });
  res.json({ ok: true, data: parsePart(row) });
});

module.exports = router;
