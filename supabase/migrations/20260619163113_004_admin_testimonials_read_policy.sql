
-- Allow authenticated (admin) users to read ALL testimonials regardless of status
CREATE POLICY "admin_read_all_testimonials" ON testimonials
  FOR SELECT TO authenticated
  USING (true);
