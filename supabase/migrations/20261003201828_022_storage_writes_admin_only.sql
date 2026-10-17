/*
# Restrict file uploads to allowlisted admins

1. Problem
   The storage write policies for the `content-images`, `story-pdfs` and
   `coloring-books` buckets only required the `authenticated` role, so any
   account could upload, overwrite or delete published files.

2. Security changes
   - INSERT / UPDATE / DELETE on objects in those three buckets now additionally
     require `public.is_admin()`.
   - Public read policies are unchanged: published files are meant to be public.

3. Notes
   1. Policies are dropped and recreated, so the migration is re-runnable.
   2. No files are modified.
*/

DO $$
DECLARE
  b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['content-images','story-pdfs','coloring-books']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', replace(b,'-','_') || '_auth_insert');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', replace(b,'-','_') || '_auth_update');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', replace(b,'-','_') || '_auth_delete');
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L AND public.is_admin())',
      replace(b,'-','_') || '_admin_insert', b);
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %L AND public.is_admin()) WITH CHECK (bucket_id = %L AND public.is_admin())',
      replace(b,'-','_') || '_admin_update', b, b);
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %L AND public.is_admin())',
      replace(b,'-','_') || '_admin_delete', b);
  END LOOP;
END $$;
