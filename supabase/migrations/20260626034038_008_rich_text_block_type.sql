-- Drop old constraint and add rich_text to allowed block types
ALTER TABLE content_blocks
  DROP CONSTRAINT IF EXISTS content_blocks_block_type_check;

ALTER TABLE content_blocks
  ADD CONSTRAINT content_blocks_block_type_check
  CHECK (block_type IN ('text','list','stat','accordion','alert','steps','divider','images','rich_text'));
