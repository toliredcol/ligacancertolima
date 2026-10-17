/*
# Visitor counters can only be incremented through the counter routine

1. Problem
   `user_stats` had an UPDATE policy open to anonymous callers with `USING (true)`
   and `WITH CHECK (true)`, so anyone could set the visitor counters to any value.

2. Security changes
   - The open public UPDATE policy on `user_stats` is removed.
   - Admins keep the ability to correct the counters.
   - `increment_user_stat` is recreated with a fixed `search_path`, limited to the
     four known visitor types and incrementing by exactly one, and remains the
     single write path available to the app.

3. Notes
   1. Public read of the counters is unchanged.
   2. The app already calls `increment_user_stat`, so visitor counting keeps
      working exactly as before.
*/

DROP POLICY IF EXISTS "public_update_user_stats" ON user_stats;

DROP POLICY IF EXISTS "admin_update_user_stats" ON user_stats;
CREATE POLICY "admin_update_user_stats"
ON user_stats FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.increment_user_stat(p_user_type text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.user_stats
  SET count = count + 1,
      updated_at = now()
  WHERE user_type = p_user_type
    AND p_user_type IN ('estudiante','padre_familia','docente','otro');
$$;

REVOKE ALL ON FUNCTION public.increment_user_stat(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_user_stat(text) TO anon, authenticated;
