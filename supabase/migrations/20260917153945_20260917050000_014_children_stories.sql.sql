/*
# Children's Stories - "El Rincón de los Cuentos"

1. Purpose
   Stores illustrated children's stories published as PDFs. Each story has a
   title, thumbnail image, PDF file, optional description, and an order_index
   for manual reordering. The admin panel manages CRUD; the public frontend
   reads and displays them.

2. New Tables
   - children_stories
     - id (uuid, primary key)
     - title (text, not null) — story title
     - thumbnail_url (text, not null) — thumbnail image URL
     - pdf_url (text, not null) — PDF file URL
     - description (text, nullable) — brief optional description
     - order_index (integer, default 0) — manual ordering
     - created_at (timestamptz, default now())

3. Storage
   - Thumbnails go to existing bucket "content-images"
   - PDFs go to a new public bucket "story-pdfs" (created below)

4. Security
   - RLS enabled on children_stories
   - Public SELECT for anon + authenticated (stories are published content)
   - INSERT/UPDATE/DELETE for authenticated only (admin manages content)
   - Storage policies for story-pdfs: public read, authenticated write
*/

-- ================================================
-- TABLE: children_stories
-- ================================================
CREATE TABLE IF NOT EXISTS children_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  thumbnail_url text NOT NULL,
  pdf_url text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE children_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_children_stories" ON children_stories;
CREATE POLICY "public_read_children_stories" ON children_stories
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_children_stories" ON children_stories;
CREATE POLICY "auth_insert_children_stories" ON children_stories
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_children_stories" ON children_stories;
CREATE POLICY "auth_update_children_stories" ON children_stories
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_children_stories" ON children_stories;
CREATE POLICY "auth_delete_children_stories" ON children_stories
  FOR DELETE TO authenticated USING (true);

-- ================================================
-- STORAGE BUCKET: story-pdfs (public, 50 MB limit)
-- ================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-pdfs',
  'story-pdfs',
  true,
  52428800,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- Storage policies for story-pdfs bucket
DROP POLICY IF EXISTS "story_pdfs_public_read" ON storage.objects;
CREATE POLICY "story_pdfs_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'story-pdfs');

DROP POLICY IF EXISTS "story_pdfs_auth_insert" ON storage.objects;
CREATE POLICY "story_pdfs_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'story-pdfs');

DROP POLICY IF EXISTS "story_pdfs_auth_update" ON storage.objects;
CREATE POLICY "story_pdfs_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'story-pdfs');

DROP POLICY IF EXISTS "story_pdfs_auth_delete" ON storage.objects;
CREATE POLICY "story_pdfs_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'story-pdfs');