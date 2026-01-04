CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`kind` text NOT NULL,
	`url_or_path` text NOT NULL,
	`mime` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `note_tags` (
	`note_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`note_id`, `tag_id`),
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `note_terms` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`category` text NOT NULL,
	`value` text NOT NULL,
	`ord` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_note_terms_note_id_category` ON `note_terms` (`note_id`,`category`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`tasted_at` text NOT NULL,
	`place` text,
	`rating` real,
	`comment` text,
	`extra_json` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_notes_product_id` ON `notes` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_notes_tasted_at` ON `notes` (`tasted_at`);--> statement-breakpoint
CREATE INDEX `idx_notes_updated_at` ON `notes` (`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_notes_rating` ON `notes` (`rating`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`producer` text,
	`country` text,
	`region` text,
	`abv` real,
	`vintage` text,
	`age` integer,
	`volume_ml` integer,
	`extra_json` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE INDEX `idx_tags_name` ON `tags` (`name`);