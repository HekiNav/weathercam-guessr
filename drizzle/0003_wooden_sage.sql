CREATE TABLE `Leaderboard` (
	`gameId` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`score` integer NOT NULL,
	`timestamp` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`gameId`) REFERENCES `Map`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Map` (
	`creationTime` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updateTime` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`type` text DEFAULT 'USER_CREATED' NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`createdBy` text NOT NULL,
	FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `MapPlaces` (
	`id` text PRIMARY KEY NOT NULL,
	`mapId` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `Image`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON UPDATE cascade ON DELETE cascade
);
