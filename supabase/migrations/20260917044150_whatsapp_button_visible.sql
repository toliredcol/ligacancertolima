/*
# WhatsApp button visibility toggle

1. Purpose
   Adds a new config key `whatsapp_visible` so the admin can publish or hide
   the floating WhatsApp button without touching code. Default is "true"
   (visible), matching the current behavior.

2. Changes
   - Inserts one row into `app_config`: key = 'whatsapp_visible', value = 'true'
   - Uses ON CONFLICT DO NOTHING so re-running is safe and never overwrites
     a value an admin has already saved.

3. Security
   - No new tables. `app_config` already has RLS enabled with public SELECT
     and authenticated-only INSERT/UPDATE/DELETE. No policy changes needed.
*/

INSERT INTO app_config (key, value) VALUES
  ('whatsapp_visible', 'true')
ON CONFLICT (key) DO NOTHING;
