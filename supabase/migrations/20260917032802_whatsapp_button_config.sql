/*
# WhatsApp floating button configuration

1. Purpose
   Adds three configuration keys to the existing `app_config` table so the admin
   panel can configure the floating WhatsApp button (image, link, open-in-new-tab)
   without touching code. The floating button's timing logic (10s delay, 5min
   cooldown, 20min session limit) is NOT changed.

2. Changes
   - Inserts three rows into `app_config` with default values matching the
     current hardcoded behavior:
       - `whatsapp_image_url`  -> current chatica.png URL
       - `whatsapp_link`       -> current wa.me link
       - `whatsapp_open_new_tab` -> "true"
   - Uses `ON CONFLICT DO NOTHING` so re-running the migration is safe and
     never overwrites values an admin has already saved.

3. Security
   - No new tables. `app_config` already has RLS enabled with:
       - public SELECT for anon + authenticated
       - authenticated-only INSERT / UPDATE / DELETE
   - No policy changes needed.
*/

INSERT INTO app_config (key, value) VALUES
  ('whatsapp_image_url', 'https://tolired.com/wp-content/uploads/2026/08/chatica.png'),
  ('whatsapp_link', 'https://wa.me/573158137106'),
  ('whatsapp_open_new_tab', 'true')
ON CONFLICT (key) DO NOTHING;
