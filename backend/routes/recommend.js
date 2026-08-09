/**
 * POST /api/recommend
 *
 * Body: { project, power, conn, budget, exp }
 *
 * Returns the full recommendation tree:
 *   mcuPick, connPick, powerPick, roles
 * plus a flat "step3Defaults" ready for the customize UI.
 */

'use strict';

const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { buildRecommendation, VALID_PROJECTS } = require('../engine/recommender');
const { getDb } = require('../db/database');

const router = Router();

const VALID_POWER  = ['battery', 'solar', 'mains'];
const VALID_CONN   = ['wifi', 'ble', 'lora', 'gsm', 'none'];
const VALID_BUDGET = ['budget', 'standard', 'premium'];
const VALID_EXP    = ['beginner', 'intermediate', 'advanced'];

const validators = [
  body('project').isIn(VALID_PROJECTS).withMessage('Invalid project type'),
  body('power')  .isIn(VALID_POWER)  .withMessage('Invalid power preference'),
  body('conn')   .isIn(VALID_CONN)   .withMessage('Invalid connectivity preference'),
  body('budget') .isIn(VALID_BUDGET) .withMessage('Invalid budget tier'),
  body('exp')    .isIn(VALID_EXP)    .withMessage('Invalid experience level'),
];

router.post('/', validators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }

  const state = {
    project: req.body.project,
    power:   req.body.power,
    conn:    req.body.conn,
    budget:  req.body.budget,
    exp:     req.body.exp,
  };

  const recommendation = buildRecommendation(state);

  // Build step3Defaults — the pre-selected IDs the wizard will show checked
  const step3Defaults = {
    mcus:          [recommendation.mcuPick.best.id],
    connectivities:[recommendation.connPick.builtin ? 'builtin' : recommendation.connPick.best.id],
    powers:        [recommendation.powerPick.best.id],
    components:    recommendation.roles.map(r => r.best.id),
  };

  // Log for analytics (non-blocking, ignore errors)
  try {
    getDb().prepare(`
      INSERT INTO recommendation_log (project_id, conn_pref, budget_pref, exp_pref, power_pref, mcu_picked)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(state.project, state.conn, state.budget, state.exp, state.power, recommendation.mcuPick.best.id);
  } catch (_) { /* non-critical */ }

  res.json({ ok: true, data: { ...recommendation, step3Defaults } });
});

module.exports = router;
