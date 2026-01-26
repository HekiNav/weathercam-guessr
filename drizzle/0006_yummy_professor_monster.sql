PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Leaderboard` (
	`mapId` text NOT NULL,
	`userId` text NOT NULL,
	`score` integer NOT NULL,
	`timestamp` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Leaderboard`("mapId", "userId", "score", "timestamp", "id") SELECT "mapId", "userId", "score", "timestamp", "id" FROM `Leaderboard`;--> statement-breakpoint
DROP TABLE `Leaderboard`;--> statement-breakpoint
ALTER TABLE `__new_Leaderboard` RENAME TO `Leaderboard`;--> statement-breakpoint
PRAGMA foreign_keys=ON;