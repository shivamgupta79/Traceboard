/**
 * Saved Builds CRUD
 *
 * GET    /api/builds?session=<id>   — list builds for a session
 * POST   /api/builds                — save a new build
 * GET    /api/builds/:id            — load a single saved build
 * DELETE /api/builds/:id            — delete a build
 */

'use strict';

const { Router } = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { calcTotal, partById, partsByCat } = require('../engine/recommender');

const router = Router();

// ── Helper: hydrate a stored build's IDs back to full part objects ─────────
function hydrateBuild(row) {
  const selected = JSON.parse(row.selected);

  function resolve(ids, allFn) {
    return (ids || []).map(id => partById(id) || allFn().find(p => p.id === id)).filter(Boolean);
  }

  return {
    id:          row.id,
    title:       row.title,
    sessionId:   row.session_id,
    projectId:   row.project_id,
    projectName: row.project_name,
    meta: {
      power:  row.power_pref,
      conn:   row.conn_pref,
      budget: row.budget_pref,
      exp:    row.exp_pref,
      projectName: row.project_name,
    },
    final: {
      mcuList:    resolve(selected.mcuList,    () => partsByCat('mcu')),
      connList:   resolve(selected.connList,   () => partsByCat('connectivity')),
      powerList:  resolve(selected.powerList,  () => partsByCat('power')),
      components: resolve(selected.components, () => [
        ...partsByCat('sensor'),
        ...partsByCat('actuator'),
      ]),
      regulator: selected.regulator ? partById(selected.regulator) : null,
    },
    totalMin:  row.total_min,
    totalMax:  row.total_max,
    createdAt: row.created_at,
  };
}

// ── GET /api/builds?session=<id> ──────────────────────────────────────────
router.get(
  '/',
  query('session').notEmpty().withMessage('session query param required'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM saved_builds WHERE session_id = ? ORDER BY created_at DESC'
    ).all(req.query.session);

    res.json({ ok: true, count: rows.length, data: rows.map(hydrateBuild) });
  }
);

// ── POST /api/builds ───────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('sessionId')    .notEmpty().withMessage('sessionId is required'),
    body('title')        .notEmpty().withMessage('title is required'),
    body('projectId')    .notEmpty().withMessage('projectId is required'),
    body('projectName')  .notEmpty().withMessage('projectName is required'),
    body('meta')         .isObject().withMessage('meta must be an object'),
    body('meta.power')   .notEmpty(),
    body('meta.conn')    .notEmpty(),
    body('meta.budget')  .notEmpty(),
    body('meta.exp')     .notEmpty(),
    body('selected')     .isObject().withMessage('selected must be an object'),
    body('selected.mcuList')    .isArray({ min: 1 }).withMessage('mcuList must be a non-empty array of IDs'),
    body('selected.connList')   .isArray().withMessage('connList must be an array'),
    body('selected.powerList')  .isArray({ min: 1 }).withMessage('powerList must be a non-empty array'),
    body('selected.components') .isArray({ min: 1 }).withMessage('components must be a non-empty array'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

    const { sessionId, title, projectId, projectName, meta, selected } = req.body;

    // Resolve parts and compute totals
    const hydrated = {
      mcuList:    selected.mcuList.map(id => partById(id)).filter(Boolean),
      connList:   selected.connList.map(id => partById(id)).filter(Boolean),
      powerList:  selected.powerList.map(id => partById(id)).filter(Boolean),
      components: selected.components.map(id => partById(id)).filter(Boolean),
      regulator:  selected.regulator ? partById(selected.regulator) : null,
    };

    const totalAvg = calcTotal(hydrated);
    const totalMin = Math.round(totalAvg * 0.9);
    const totalMax = Math.round(totalAvg * 1.1);

    const id = uuidv4();
    const db = getDb();

    db.prepare(`
      INSERT INTO saved_builds
        (id, session_id, title, project_id, project_name,
         power_pref, conn_pref, budget_pref, exp_pref,
         selected, total_min, total_max)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, sessionId, title, projectId, projectName,
      meta.power, meta.conn, meta.budget, meta.exp,
      JSON.stringify(selected),
      totalMin, totalMax
    );

    const saved = db.prepare('SELECT * FROM saved_builds WHERE id = ?').get(id);
    res.status(201).json({ ok: true, data: hydrateBuild(saved) });
  }
);

// ── GET /api/builds/:id ────────────────────────────────────────────────────
router.get(
  '/:id',
  param('id').isUUID().withMessage('Invalid build ID'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

    const db  = getDb();
    const row = db.prepare('SELECT * FROM saved_builds WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ ok: false, error: 'Build not found' });

    res.json({ ok: true, data: hydrateBuild(row) });
  }
);

// ── DELETE /api/builds/:id ─────────────────────────────────────────────────
router.delete(
  '/:id',
  param('id').isUUID().withMessage('Invalid build ID'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

    const db = getDb();
    const row = db.prepare('SELECT id FROM saved_builds WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ ok: false, error: 'Build not found' });

    db.prepare('DELETE FROM saved_builds WHERE id = ?').run(req.params.id);
    res.json({ ok: true, message: 'Build deleted' });
  }
);

module.exports = router;
