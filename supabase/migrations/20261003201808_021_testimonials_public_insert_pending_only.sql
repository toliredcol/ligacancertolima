/*
# New testimonials must await moderation

1. Problem
   The public INSERT policy on `testimonials` had `WITH CHECK (true)`, so a
   request sent directly to the API could set `status = 'approved'` and publish
   text on the public site without moderation, and could also attach an arbitrary
   external image address through `avatar_url`.

2. Security changes
   - Public INSERT on `testimonials` now requires `status = 'pending'`,
     `avatar_url IS NULL`, and sane lengths for `name` and `story`.

3. Notes
   1. The submission form already sends `status: 'pending'` and never sends an
      avatar, so the legitimate flow is unaffected.
   2. Admins can still approve, edit or reject through the moderation screen.
*/

DROP POLICY IF EXISTS "public_insert_testimonials" ON testimonials;
CREATE POLICY "public_insert_testimonials"
ON testimonials FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND avatar_url IS NULL
  AND char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(btrim(story)) BETWEEN 1 AND 4000
);
