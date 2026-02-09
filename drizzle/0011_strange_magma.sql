PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Notification` (
	`creationTime` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`recipientId` text NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`senderId` text,
	`read` numeric DEFAULT 'false' NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Notification`("creationTime", "id", "recipientId", "type", "message", "senderId", "read", "title") SELECT "creationTime", "id", "recipientId", "type", "message", "senderId", "read", "title" FROM `Notification`;--> statement-breakpoint
DROP TABLE `Notification`;--> statement-breakpoint
ALTER TABLE `__new_Notification` RENAME TO `Notification`;--> statement-breakpoint
PRAGMA foreign_keys=ON;