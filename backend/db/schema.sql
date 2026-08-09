-- Traceboard SQLite Schema
-- Parts catalogue (seeded from data.js, editable via admin)
CREATE TABLE IF NOT EXISTS parts (
  id          TEXT PRIMARY KEY,
  cat         TEXT NOT NULL CHECK(cat IN ('mcu','sensor','actuator','connectivity','power')),
  name        TEXT NOT NULL,
  price_min   INTEGER NOT NULL,
  price_max   INTEGER NOT NULL,
  tags        TEXT NOT NULL DEFAULT '[]',   -- JSON array
  description TEXT NOT NULL DEFAULT '',
  pros        TEXT NOT NULL DEFAULT '[]',   -- JSON array
  cons        TEXT NOT NULL DEFAULT '[]',   -- JSON array
  wiring_iface TEXT,
  wiring_pins  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Saved builds (per-session, identified by a UUID)
CREATE TABLE IF NOT EXISTS saved_builds (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL,
  title       TEXT NOT NULL,
  project_id  TEXT NOT NULL,
  project_name TEXT NOT NULL,
  power_pref  TEXT NOT NULL,
  conn_pref   TEXT NOT NULL,
  budget_pref TEXT NOT NULL,
  exp_pref    TEXT NOT NULL,
  selected    TEXT NOT NULL,  -- JSON: { mcuList, connList, powerList, components, regulator }
  total_min   INTEGER NOT NULL DEFAULT 0,
  total_max   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Recommendation audit log (optional analytics)
CREATE TABLE IF NOT EXISTS recommendation_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id  TEXT NOT NULL,
  conn_pref   TEXT NOT NULL,
  budget_pref TEXT NOT NULL,
  exp_pref    TEXT NOT NULL,
  power_pref  TEXT NOT NULL,
  mcu_picked  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_parts_cat       ON parts(cat);
CREATE INDEX IF NOT EXISTS idx_builds_session  ON saved_builds(session_id);
