DROP INDEX `User_email_key`;--> statement-breakpoint
CREATE UNIQUE INDEX `User_email` ON `User` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `Username` ON `User` (`name`);