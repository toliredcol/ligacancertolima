
/*
# Add user_stats, app_config tables; extend content_blocks for images

1. New Tables
- `user_stats` - Accumulates visit counts by user type (read-only counters, never deletable via UI)
  - `user_type` text (estudiante | padre_familia | docente | otro)
  - `count` integer (accumulated, never reset)
- `app_config` - Key/value store for app-wide configuration (logo URL, etc.)
  - `key` text (unique, e.g. 'logo_url')
  - `value` text

2. Modified Tables
- `content_blocks` - Add 'images' to the allowed block_type values

3. Security
- RLS enabled on both new tables
- user_stats: public insert (increment), public read; no delete policy (by design)
- app_config: public read, authenticated write
*/

-- ================================================
-- USER STATS (counters only — no delete policy)
-- ================================================
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL CHECK (user_type IN ('estudiante','padre_familia','docente','otro')),
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_type)
);

-- Seed initial rows so we can always do UPDATE
INSERT INTO user_stats (user_type, count) VALUES
  ('estudiante',    0),
  ('padre_familia', 0),
  ('docente',       0),
  ('otro',          0)
ON CONFLICT (user_type) DO NOTHING;

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_user_stats" ON user_stats;
CREATE POLICY "public_read_user_stats" ON user_stats FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_update_user_stats" ON user_stats;
CREATE POLICY "public_update_user_stats" ON user_stats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- No DELETE policy intentionally — counters cannot be deleted

-- ================================================
-- APP CONFIG (key/value)
-- ================================================
CREATE TABLE IF NOT EXISTS app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO app_config (key, value)
VALUES ('logo_url', '')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_app_config" ON app_config;
CREATE POLICY "public_read_app_config" ON app_config FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_app_config" ON app_config;
CREATE POLICY "admin_update_app_config" ON app_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_insert_app_config" ON app_config;
CREATE POLICY "admin_insert_app_config" ON app_config FOR INSERT TO authenticated WITH CHECK (true);

-- ================================================
-- EXTEND content_blocks to allow 'images' type
-- ================================================
ALTER TABLE content_blocks DROP CONSTRAINT IF EXISTS content_blocks_block_type_check;
ALTER TABLE content_blocks ADD CONSTRAINT content_blocks_block_type_check
  CHECK (block_type IN ('text','list','stat','accordion','alert','steps','divider','images'));
