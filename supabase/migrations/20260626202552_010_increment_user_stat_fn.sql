-- Create atomic RPC function for incrementing user type stats
CREATE OR REPLACE FUNCTION increment_user_stat(p_user_type text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE user_stats
  SET count = count + 1,
      updated_at = now()
  WHERE user_type = p_user_type;
$$;

-- Allow both anon (public users) and authenticated (admin) to call it
GRANT EXECUTE ON FUNCTION increment_user_stat(text) TO anon, authenticated;
