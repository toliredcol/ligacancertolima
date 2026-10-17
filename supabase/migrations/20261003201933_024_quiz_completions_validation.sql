/*
# Validate quiz completion records on the server

1. Problem
   The public INSERT policy on `quiz_completions` accepted any values, so a
   request sent straight to the API could store impossible scores (inflating the
   public progress percentages) or arbitrary participant text.

2. Modified Tables
   - `quiz_completions`: adds CHECK constraints
     - `total_questions` between 1 and 200
     - `score` between 0 and `total_questions`
     - `user_name` length between 1 and 60

3. Security changes
   - The public INSERT policy now enforces the same bounds, plus a module
     reference that exists.

4. Notes
   1. All 6 existing rows satisfy the constraints, so nothing is rejected.
   2. The in-app quiz keeps saving results exactly as before.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_completions_totals_valid') THEN
    ALTER TABLE quiz_completions
      ADD CONSTRAINT quiz_completions_totals_valid
      CHECK (total_questions >= 1 AND total_questions <= 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_completions_score_valid') THEN
    ALTER TABLE quiz_completions
      ADD CONSTRAINT quiz_completions_score_valid
      CHECK (score >= 0 AND score <= total_questions);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_completions_name_valid') THEN
    ALTER TABLE quiz_completions
      ADD CONSTRAINT quiz_completions_name_valid
      CHECK (char_length(user_name) >= 1 AND char_length(user_name) <= 60);
  END IF;
END $$;

DROP POLICY IF EXISTS "public_insert_quiz_completions" ON quiz_completions;
CREATE POLICY "public_insert_quiz_completions"
ON quiz_completions FOR INSERT
TO anon, authenticated
WITH CHECK (
  total_questions BETWEEN 1 AND 200
  AND score BETWEEN 0 AND total_questions
  AND char_length(btrim(user_name)) BETWEEN 1 AND 60
  AND EXISTS (SELECT 1 FROM modules m WHERE m.id = module_id)
);
