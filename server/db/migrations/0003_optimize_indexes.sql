DROP INDEX IF EXISTS idx_tags_name;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags (tag_id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON attachments (note_id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_note_terms_category_value ON note_terms (category, value);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_products_kind ON products (kind);
