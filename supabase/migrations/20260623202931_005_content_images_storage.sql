-- ================================================
-- STORAGE BUCKET: content-images (public, 50 MB limit)
-- ================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  52428800,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml'];

-- Storage policies for content-images bucket
DROP POLICY IF EXISTS "content_images_public_read" ON storage.objects;
CREATE POLICY "content_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'content-images');

DROP POLICY IF EXISTS "content_images_auth_insert" ON storage.objects;
CREATE POLICY "content_images_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content-images');

DROP POLICY IF EXISTS "content_images_auth_update" ON storage.objects;
CREATE POLICY "content_images_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'content-images');

DROP POLICY IF EXISTS "content_images_auth_delete" ON storage.objects;
CREATE POLICY "content_images_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'content-images');

-- ================================================
-- TABLE: uploaded_images
-- ================================================
CREATE TABLE IF NOT EXISTS uploaded_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text NOT NULL,
  filename text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  size_bytes integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_uploaded_images" ON uploaded_images
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "auth_insert_uploaded_images" ON uploaded_images
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_delete_uploaded_images" ON uploaded_images
  FOR DELETE TO authenticated USING (true);
