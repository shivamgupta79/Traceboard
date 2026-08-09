/**
 * Traceboard Backend — Express REST API
 *
 * Base URL : http://localhost:3001
 *
 * Routes
 * ──────
 * GET  /api/health                       — liveness check
 * GET  /api/parts                        — full catalogue  (?cat=&q=)
 * GET  /api/parts/stats                  — catalogue counts
 * GET  /api/parts/:id                    — single part
 *
 * POST /api/recommend                    — recommendation engine
 *
 * GET  /api/builds?session=<id>          — list saved builds for a session
 * POST /api/builds                       — save a build
 * GET  /api/builds/:id                   — load one saved build
 * DELETE /api/builds/:id                 — delete a saved build
 *
 * POST /api/export/txt                   — download a .txt parts list
 * POST /api/export/json                  — download a JSON build export
 *
 * GET  /api/analytics/popular-projects   — analytics (recommendation log)
 * GET  /api/analytics/popular-mcus
 * GET  /api/analytics/prefs
 */

'use strict';

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

const partsRouter     = require('./routes/parts');
const recommendRouter = require('./routes/recommend');
const buildsRouter    = require('./routes/builds');
const exportRouter    = require('./routes/export');
const analyticsRouter = require('./routes/analytics');

// Suppress experimental SQLite warning (Node 22/24 built-in module)
process.removeAllListeners('warning');
process.on('warning', (w) => {
  if (w.name === 'ExperimentalWarning' && w.message.includes('SQLite')) return;
  console.warn(w);
});

// Boot the database connection + schema + seed
require('./db/database').getDb();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    ok:      true,
    service: 'traceboard-api',
    version: '1.0.0',
    ts:      new Date().toISOString(),
  });
});

app.use('/api/parts',     partsRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/builds',    buildsRouter);
app.use('/api/export',    exportRouter);
app.use('/api/analytics', analyticsRouter);

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✦  Traceboard API running on http://localhost:${PORT}`);
  console.log(`     Health check → http://localhost:${PORT}/api/health\n`);
});
