PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_MapPlaces` (
	`imageId` text NOT NULL,
	`mapId` text NOT NULL,
	PRIMARY KEY(`mapId`, `imageId`),
	FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_MapPlaces`("imageId", "mapId") SELECT "imageId", "mapId" FROM `MapPlaces`;--> statement-breakpoint
DROP TABLE `MapPlaces`;--> statement-breakpoint
ALTER TABLE `__new_MapPlaces` RENAME TO `MapPlaces`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_Map` (
	`creationTime` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updateTime` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`type` text DEFAULT 'USER_CREATED' NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`createdBy` text,
	FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Map`("creationTime", "updateTime", "type", "id", "createdBy") SELECT "creationTime", "updateTime", "type", "id", "createdBy" FROM `Map`;--> statement-breakpoint
DROP TABLE `Map`;--> statement-breakpoint
ALTER TABLE `__new_Map` RENAME TO `Map`;