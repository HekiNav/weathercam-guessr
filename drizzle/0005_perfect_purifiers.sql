PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Leaderboard` (
	`mapId` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`score` integer NOT NULL,
	`timestamp` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Leaderboard`("mapId", "userId", "score", "timestamp") SELECT "mapId", "userId", "score", "timestamp" FROM `Leaderboard`;--> statement-breakpoint
DROP TABLE `Leaderboard`;--> statement-breakpoint
ALTER TABLE `__new_Leaderboard` RENAME TO `Leaderboard`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `Map` ADD `visibility` text DEFAULT 'PUBLIC' NOT NULL;