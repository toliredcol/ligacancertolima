/*
# Add external-URL option to additional pages

1. What this changes
   The additional pages (the buttons managed under "Páginas de contenido")
   currently only open an internal page with rich-text content. This migration
   lets each page be either **HTML content** or an **external URL**.

2. New columns on `custom_pages`
   - `content_type` (text, default `'html'`) - `'html'` or `'external_url'`
   - `external_url` (text, nullable) - the destination URL when the type is external
   - `open_in_new_tab` (boolean, default false) - whether the URL opens in a new
     tab (true) or replaces the current view (false)

3. Why it is safe
   - Existing rows keep `content_type = 'html'`, so every currently published
     page keeps working exactly as before.
   - No data is deleted or altered; only new optional columns are added.

4. Notes
   - Admin write policies are unchanged (already restricted to allowlisted admins).
   - Idempotent: each column is added only if it does not already exist.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'custom_pages' AND column_name = 'content_type') THEN
    ALTER TABLE custom_pages ADD COLUMN content_type text NOT NULL DEFAULT 'html';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'custom_pages' AND column_name = 'external_url') THEN
    ALTER TABLE custom_pages ADD COLUMN external_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'custom_pages' AND column_name = 'open_in_new_tab') THEN
    ALTER TABLE custom_pages ADD COLUMN open_in_new_tab boolean NOT NULL DEFAULT false;
  END IF;
END $$;
