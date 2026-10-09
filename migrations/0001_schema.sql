-- SHS Evaluation Tool — D1 schema (blueprint §28 + documentary requirements)
-- Applied with: pnpm exec wrangler d1 migrate shs-evaluation --local
--              pnpm exec wrangler d1 migrate shs-evaluation --remote

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schools (
  evaluation_id TEXT PRIMARY KEY REFERENCES evaluations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  school_id TEXT NOT NULL DEFAULT '',
  shs_curriculum TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  division TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  administrator_name TEXT NOT NULL DEFAULT '',
  contact_number TEXT NOT NULL DEFAULT '',
  official_email TEXT NOT NULL DEFAULT '',
  school_year TEXT NOT NULL DEFAULT '',
  recognition_applied_for TEXT NOT NULL DEFAULT '',
  ocular_inspection_date TEXT,
  submission_date_sdo TEXT,
  submission_date_ro TEXT
);

CREATE TABLE IF NOT EXISTS evaluators (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_evaluators_eval ON evaluators(evaluation_id);

CREATE TABLE IF NOT EXISTS ratings (
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  indicator_id TEXT NOT NULL,
  rating INTEGER,
  remarks TEXT NOT NULL DEFAULT '',
  mov_status TEXT NOT NULL DEFAULT 'not-checked',
  mov_checked TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (evaluation_id, indicator_id)
);

CREATE TABLE IF NOT EXISTS doc_requirements (
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  doc_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not-checked',
  remarks TEXT,
  PRIMARY KEY (evaluation_id, doc_id)
);

CREATE TABLE IF NOT EXISTS findings (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  area_id TEXT NOT NULL DEFAULT '',
  indicator_id TEXT,
  finding TEXT NOT NULL DEFAULT '',
  recommendation TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_findings_eval ON findings(evaluation_id);
