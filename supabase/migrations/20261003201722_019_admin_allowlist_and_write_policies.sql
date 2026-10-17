/*
# Restrict content administration to an explicit admin allowlist

1. Problem
   Every write policy on the content tables was granted to the `authenticated`
   role with a `true` predicate. Because the project uses the public anon key and
   the Supabase Auth sign-up endpoint is reachable by anyone, any person could
   create an account and then insert, update or delete all application content.

2. New Tables
   - `admin_users`
     - `user_id` (uuid, primary key, references auth.users) - accounts allowed to
       administer the application.
     - `created_at` (timestamptz)
   RLS is enabled and NO client policy is created, so the table is invisible to
   the browser; it is only consulted by the helper function below.

3. New Functions
   - `public.is_admin()` - SECURITY DEFINER, fixed search_path, returns true when
     the current session belongs to an allowlisted admin.

4. Security changes
   - Existing admin accounts are seeded from the current auth users.
   - Every INSERT / UPDATE / DELETE policy that was scoped to `authenticated`
     with a `true` predicate on the content tables is recreated with
     `public.is_admin()`.
   - Public read policies are intentionally left unchanged: the content is public.

5. Notes
   1. Idempotent: the table/function use IF NOT EXISTS / CREATE OR REPLACE, and
      policies are dropped before being recreated.
   2. No data is deleted or altered by this migration.
*/

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

INSERT INTO admin_users (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'modules','content_blocks','custom_pages','children_stories','quiz_questions',
    'videos','resources','slider_images','matching_game_pairs','uploaded_images',
    'app_config','diploma_config','testimonials','quiz_completions'
  ]
  LOOP
    -- drop every write policy currently granted only to the authenticated role
    FOR p IN
      SELECT policyname, cmd
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t
        AND cmd IN ('INSERT','UPDATE','DELETE')
        AND roles = ARRAY['authenticated']::name[]
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
      IF p.cmd = 'INSERT' THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())',
          'admin_insert_' || t, t);
      ELSIF p.cmd = 'UPDATE' THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
          'admin_update_' || t, t);
      ELSE
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_admin())',
          'admin_delete_' || t, t);
      END IF;
    END LOOP;
  END LOOP;
END $$;
