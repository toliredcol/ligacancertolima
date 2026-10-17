/*
# Add "Libro para Colorear (HTML5)" content type to El Rincón de los Cuentos

1. Purpose
   Extend the existing children_stories table to support a third content type:
   "coloring" — a self-contained HTML5 coloring book file, alongside the existing
   "pdf" (illustrated PDF story) and "video" (vertical YouTube video) types.

2. Changes to existing table: children_stories
   - Add column `html_file_url` (text, nullable).
     Stores the public URL of the uploaded self-contained HTML file.
     Only used when content_type = 'coloring'.
   - No change to the `content_type` column itself: it is plain text with no
     CHECK constraint, so it already accepts the new value 'coloring'.
     Existing rows are unaffected.

3. New storage bucket: coloring-books
   - Public bucket for self-contained HTML coloring books.
   - File size limit: 20 MB (20971520 bytes) — larger than the image limit,
     because HTML files embed their own resources.
   - Allowed MIME type: text/html.
   - Storage policies: public read for anon + authenticated, write for
     authenticated (admin) only.

4. Security
   - No changes to existing RLS policies on children_stories (public read,
     authenticated write already in place).
   - New storage policies only for the coloring-books bucket.

5. Notes
   - Idempotent: column addition guarded by IF NOT EXISTS; bucket upserted via
     ON CONFLICT; policies dropped before re-create.
   - No data is lost.
*/

-- Add html_file_url column (nullable, only used for coloring type)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children_stories' AND column_name = 'html_file_url'
  ) THEN
    ALTER TABLE children_stories ADD COLUMN html_file_url text;
  END IF;
END $$;

-- ================================================
-- STORAGE BUCKET: coloring-books (public, 20 MB limit)
-- ================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coloring-books',
  'coloring-books',
  true,
  20971520,
  ARRAY['text/html']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['text/html'];

-- Storage policies for coloring-books bucket
DROP POLICY IF EXISTS "coloring_books_public_read" ON storage.objects;
CREATE POLICY "coloring_books_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'coloring-books');

DROP POLICY IF EXISTS "coloring_books_auth_insert" ON storage.objects;
CREATE POLICY "coloring_books_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'coloring-books');

DROP POLICY IF EXISTS "coloring_books_auth_update" ON storage.objects;
CREATE POLICY "coloring_books_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'coloring-books');

DROP POLICY IF EXISTS "coloring_books_auth_delete" ON storage.objects;
CREATE POLICY "coloring_books_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'coloring-books');
