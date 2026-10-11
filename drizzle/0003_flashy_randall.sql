CREATE TABLE `mecabot_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
