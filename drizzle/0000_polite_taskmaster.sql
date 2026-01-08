-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `d1_migrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text,
	`applied_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Image` (
	`id` text PRIMARY KEY NOT NULL,
	`externalId` text NOT NULL,
	`source` text DEFAULT 'DIGITRAFFIC' NOT NULL,
	`type` text DEFAULT 'UNCLASSIFIED' NOT NULL,
	`difficulty` text DEFAULT 'UNCLASSIFIED' NOT NULL,
	`updateTime` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`reviewState` text DEFAULT 'INCOMPLETE' NOT NULL,
	`available` numeric DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Image_externalId_key` ON `Image` (`externalId`);--> statement-breakpoint
CREATE TABLE `Rect` (
	`id` text PRIMARY KEY NOT NULL,
	`x` real NOT NULL,
	`y` real NOT NULL,
	`width` real NOT NULL,
	`height` real NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `Image`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`admin` numeric DEFAULT false NOT NULL,
	`email` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);--> statement-breakpoint
CREATE TABLE `OtpCode` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`codeHash` text NOT NULL,
	`expiresAt` numeric NOT NULL,
	`used` numeric DEFAULT false NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` numeric NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);

*/