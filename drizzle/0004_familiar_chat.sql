CREATE TABLE `affiliate_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text DEFAULT '[]' NOT NULL,
	`synced_at` integer DEFAULT 0 NOT NULL,
	`locked_until` integer DEFAULT 0 NOT NULL,
	`limited` integer DEFAULT 1 NOT NULL
);
