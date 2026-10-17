/*
# Add "Juego en línea" (online game) content type to El Rincón de los Cuentos

1. Purpose
   Extend the existing children_stories table to support a fourth content type:
   "game" — an external online game, alongside the existing "pdf" (downloadable
   illustrated PDF), "video" (vertical YouTube video) and "coloring" (HTML5
   coloring book) types. Games are opened in a portrait (taller-than-wide)
   viewer on the public site.

2. Changes to existing table: children_stories
   - Add column `game_url` (text, nullable).
     Stores the HTTPS URL of the external game page.
     Only used when content_type = 'game'.
   - No change to the `content_type` column itself: it is plain text with no
     CHECK constraint, so it already accepts the new value 'game'.
     Existing rows are unaffected.

3. Security
   - No changes to existing RLS policies on children_stories (public read,
     authenticated write already in place). No new storage bucket is required
     because games are external URLs, not uploaded files.

4. Notes
   - Idempotent: column addition guarded by IF NOT EXISTS.
   - No data is lost.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children_stories' AND column_name = 'game_url'
  ) THEN
    ALTER TABLE children_stories ADD COLUMN game_url text;
  END IF;
END $$;
