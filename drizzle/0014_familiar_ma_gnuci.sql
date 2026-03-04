PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Map` (
	`creationTime` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updateTime` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`type` text DEFAULT 'USER_CREATED' NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`createdById` text,
	`visibility` text DEFAULT 'PUBLIC' NOT NULL,
	`imageOrder` text DEFAULT 'RANDOM' NOT NULL,
	`imageLocationBlurred` numeric DEFAULT 'true' NOT NULL,
	`imageGeojsonAvailable` numeric DEFAULT 'false' NOT NULL,
	`name` text,
	FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Map`("creationTime", "updateTime", "type", "id", "createdById", "visibility", "imageOrder", "imageLocationBlurred", "imageGeojsonAvailable", "name") SELECT "creationTime", "updateTime", "type", "id", "createdById", "visibility", "imageOrder", "imageLocationBlurred", "imageGeojsonAvailable", "name" FROM `Map`;--> statement-breakpoint
DROP TABLE `Map`;--> statement-breakpoint
ALTER TABLE `__new_Map` RENAME TO `Map`;--> statement-breakpoint
PRAGMA foreign_keys=ON;