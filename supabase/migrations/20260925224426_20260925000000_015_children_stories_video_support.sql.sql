/*
# Add video support to children_stories (El Rincón de los Cuentos)

1. Purpose
   Extend the existing children_stories table to support a second content type:
   vertical YouTube videos, in addition to the existing PDF stories. This allows
   the admin to publish both PDF cuentos and YouTube Shorts/videos side by side
   in the same gallery.

2. Changes to existing table: children_stories
   - Add column `content_type` (text, NOT NULL, DEFAULT 'pdf')
     Values: 'pdf' ( illustrated PDF story) or 'video' (vertical YouTube video).
     Existing rows automatically get 'pdf' as the default.
   - Add column `youtube_url` (text, nullable)
     Stores the full YouTube URL or video ID. Only used when content_type = 'video'.
   - Make `pdf_url` nullable, since video entries don't have a PDF file.
     Existing PDF stories are unaffected — they already have a pdf_url value.

3. Security
   - No changes to existing RLS policies. The table already has:
     - public_read_children_stories (SELECT for anon, authenticated)
     - auth_insert/update/delete (authenticated only)
   - No new storage buckets needed — videos are embedded via YouTube, not stored.

4. Notes
   - This migration is idempotent (uses DO $$ ... IF NOT EXISTS ... END $$ blocks).
   - No data is lost: existing rows keep their pdf_url and gain content_type='pdf'.
*/

-- Add content_type column (defaults to 'pdf' for all existing rows)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children_stories' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE children_stories ADD COLUMN content_type text NOT NULL DEFAULT 'pdf';
  END IF;
END $$;

-- Add youtube_url column (nullable, only used for video type)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children_stories' AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE children_stories ADD COLUMN youtube_url text;
  END IF;
END $$;

-- Make pdf_url nullable (video entries don't have a PDF)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children_stories' AND column_name = 'pdf_url'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE children_stories ALTER COLUMN pdf_url DROP NOT NULL;
  END IF;
END $$;
