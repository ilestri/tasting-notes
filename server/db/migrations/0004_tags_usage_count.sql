ALTER TABLE tags ADD COLUMN usage_count integer NOT NULL DEFAULT 0;
--> statement-breakpoint
UPDATE tags
SET usage_count = (
  SELECT count(*) FROM note_tags WHERE note_tags.tag_id = tags.id
);
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS trg_note_tags_usage_insert
AFTER INSERT ON note_tags
BEGIN
  UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS trg_note_tags_usage_delete
AFTER DELETE ON note_tags
BEGIN
  UPDATE tags SET usage_count = CASE WHEN usage_count > 0 THEN usage_count - 1 ELSE 0 END
  WHERE id = OLD.tag_id;
END;
