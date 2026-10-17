/*
# Hide unapproved testimonials from the public

1. Problem
   The policy named `public_read_approved_testimonials` had the predicate `true`,
   so anyone using the public key could read every testimonial, including
   submissions still pending moderation and ones that were rejected. Only the
   browser code filtered by status.

2. Security changes
   - Public SELECT on `testimonials` now requires `status = 'approved'`.
   - The moderation view keeps full read access, but restricted to allowlisted
     admins through `public.is_admin()`.

3. Notes
   1. No data is changed; only read visibility.
   2. The public pages already query `status = 'approved'`, so behaviour for
      visitors is unchanged.
*/

DROP POLICY IF EXISTS "public_read_approved_testimonials" ON testimonials;
CREATE POLICY "public_read_approved_testimonials"
ON testimonials FOR SELECT
TO anon, authenticated
USING (status = 'approved');

DROP POLICY IF EXISTS "admin_read_all_testimonials" ON testimonials;
CREATE POLICY "admin_read_all_testimonials"
ON testimonials FOR SELECT
TO authenticated
USING (public.is_admin());
