PRAGMA foreign_keys=off;
--> statement-breakpoint

CREATE TABLE `notes_new` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`rating` real,
	`comment` text,
	`extra_json` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint

INSERT INTO `notes_new` (
	`id`,
	`product_id`,
	`rating`,
	`comment`,
	`extra_json`,
	`created_at`,
	`updated_at`
)
SELECT
	`id`,
	`product_id`,
	`rating`,
	`comment`,
	`extra_json`,
	`created_at`,
	`updated_at`
FROM `notes`;
--> statement-breakpoint

DROP TABLE `notes`;
--> statement-breakpoint
ALTER TABLE `notes_new` RENAME TO `notes`;
--> statement-breakpoint

CREATE INDEX `idx_notes_product_id` ON `notes` (`product_id`);
--> statement-breakpoint
CREATE INDEX `idx_notes_updated_at` ON `notes` (`updated_at`);
--> statement-breakpoint
CREATE INDEX `idx_notes_rating` ON `notes` (`rating`);
--> statement-breakpoint

PRAGMA foreign_keys=on;
