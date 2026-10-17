/*
# Add per-slide transition effect to slider_images

1. Purpose
   Allow each slider image to have its own configurable transition effect,
   chosen from the admin panel. The frontend slider reads the incoming slide's
   effect and applies the corresponding CSS animation.

2. Changes to existing table: slider_images
   - Add column `transition_effect` (text, nullable, DEFAULT 'fade')
     Valid values: 'fade', 'slide-left', 'slide-up', 'zoom-in',
                   'cube', 'flip', 'ken-burns', 'blur-fade'
     Existing rows automatically get 'fade' as the default.

3. Security
   - No changes to existing RLS policies. The table already has appropriate
     public read and authenticated-only write policies.

4. Notes
   - This migration is idempotent (uses DO $$ ... IF NOT EXISTS ... END $$).
   - No data is lost: existing rows keep all their data and gain transition_effect='fade'.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slider_images' AND column_name = 'transition_effect'
  ) THEN
    ALTER TABLE slider_images ADD COLUMN transition_effect text NOT NULL DEFAULT 'fade';
  END IF;
END $$;
