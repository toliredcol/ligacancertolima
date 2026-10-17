-- Activate matching game on all modules that currently have it disabled
UPDATE modules
SET matching_game_active = true
WHERE matching_game_active = false;
