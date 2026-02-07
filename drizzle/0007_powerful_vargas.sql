CREATE TABLE `Friend` (
	`creationTime` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`user1id` text NOT NULL,
	`user2id` text NOT NULL,
	`state` text DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users` ON `Friend` (`user1id`,`user2id`);--> statement-breakpoint
CREATE TABLE `Notification` (
	`creationTime` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`recipient` text NOT NULL,
	`type` text NOT NULL,
	`friendId` text
);
--> statement-breakpoint
ALTER TABLE `Map` ADD `imageOrder` text DEFAULT 'RANDOM' NOT NULL;--> statement-breakpoint
ALTER TABLE `Map` ADD `imageLocationBlurred` numeric DEFAULT 'true' NOT NULL;--> statement-breakpoint
ALTER TABLE `Map` ADD `imageGeojsonAvailable` numeric DEFAULT 'false' NOT NULL;--> statement-breakpoint
ALTER TABLE `MapPlaces` ADD `index` integer DEFAULT 0 NOT NULL;