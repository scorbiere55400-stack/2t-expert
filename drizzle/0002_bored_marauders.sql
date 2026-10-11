CREATE TABLE `diagnostic_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`machine_id` text,
	`payload` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `diagnostic_cases_user_updated` ON `diagnostic_cases` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `diagnostic_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`case_id` text NOT NULL,
	`outcome` text NOT NULL,
	`note` text NOT NULL,
	`consent` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `diagnostic_cases`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `diagnostic_feedback_case` ON `diagnostic_feedback` (`case_id`);--> statement-breakpoint
CREATE INDEX `diagnostic_feedback_status` ON `diagnostic_feedback` (`status`);