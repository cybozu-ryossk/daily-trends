-- daily-trends-interests D1 schema
-- Replaces the "## 興味領域" and "## 収集ソース" sections of the old interests.md.
-- Prose-only guidance (業務文脈・収集上限・カテゴリ粒度メモ) stays in collect/guidance.md.

DROP TABLE IF EXISTS interest_flags;
CREATE TABLE interest_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('core', 'rising', 'watching', 'suppressed')),
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d', 'now'))
);

DROP TABLE IF EXISTS sources;
CREATE TABLE sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d', 'now'))
);
