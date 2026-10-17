CREATE TABLE IF NOT EXISTS custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content_html text NOT NULL DEFAULT '',
  show_on_home boolean NOT NULL DEFAULT false,
  button_text text NOT NULL DEFAULT '',
  button_bg_color text NOT NULL DEFAULT '#5170ff',
  button_text_color text NOT NULL DEFAULT '#ffffff',
  button_icon_url text,
  button_icon_position text NOT NULL DEFAULT 'left' CHECK (button_icon_position IN ('left','right')),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE custom_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_custom_pages" ON custom_pages
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin_insert_custom_pages" ON custom_pages
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "admin_update_custom_pages" ON custom_pages
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_delete_custom_pages" ON custom_pages
  FOR DELETE TO authenticated USING (true);
