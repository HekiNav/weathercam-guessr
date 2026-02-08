ALTER TABLE `Notification` RENAME COLUMN "recipient" TO "recipientId";--> statement-breakpoint
ALTER TABLE `Notification` RENAME COLUMN "friendId" TO "senderId";--> statement-breakpoint
ALTER TABLE `Notification` ADD `message` text NOT NULL;