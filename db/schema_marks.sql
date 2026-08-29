-- Per-article interest marks ("興味あり" star on the day pages).
-- Append-only addition to schema.sql (which defines interest_flags/sources) —
-- uses IF NOT EXISTS so it's safe to re-run without wiping existing data.

CREATE TABLE IF NOT EXISTS article_marks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  url TEXT NOT NULL,
  title_ja TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(date, url)
);

CREATE INDEX IF NOT EXISTS idx_article_marks_date ON article_marks(date);
