import { sqliteTable, integer, text, numeric, uniqueIndex, real, primaryKey } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"
import { relations } from "drizzle-orm/relations";

export const image = sqliteTable("Image", {
	id: text().primaryKey().notNull(),
	externalId: text().notNull(),
	source: text().default("DIGITRAFFIC").notNull(),
	type: text().default("UNCLASSIFIED").notNull(),
	difficulty: text().default("UNCLASSIFIED").notNull(),
	updateTime: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	reviewState: text().default("INCOMPLETE").notNull(),
	available: numeric().default("true").notNull(),
	lat: real().notNull().default(0),
	lon: real().notNull().default(0)
},
	(table) => [
		uniqueIndex("Image_externalId_key").on(table.externalId),
	]);
export const map = sqliteTable("Map", {
	creationTime: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updateTime: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	type: text().default("USER_CREATED").notNull(), // USER_CREATED | DAILY_CHALLENGE
	id: text().primaryKey().notNull(),
	createdBy: text().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	visibility: text().notNull().default("PUBLIC"),
	imageOrder: text().notNull().default("RANDOM"),
	imageLocationBlurred: numeric().default("true").notNull(),
	imageGeojsonAvailable: numeric().default("false").notNull(),
})
export const mapPlace = sqliteTable("MapPlaces", {
	imageId: text().notNull().references(() => image.id, { onDelete: "cascade", onUpdate: "cascade" }),
	mapId: text().notNull().references(() => map.id, { onDelete: "cascade", onUpdate: "cascade" }),
	index: integer().notNull().default(0)
}, (t) => ([
	primaryKey({columns: [t.mapId, t.imageId]})
]))

export const leaderboard = sqliteTable("Leaderboard", {
	mapId: text().notNull().references(() => map.id, { onDelete: "cascade", onUpdate: "cascade" }),
	userId: text().notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	score: integer().notNull(),
	timestamp: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	id: text().primaryKey().notNull()
})

export const rect = sqliteTable("Rect", {
	id: text().primaryKey().notNull().references(() => image.id, { onDelete: "restrict", onUpdate: "cascade" }),
	x: real().notNull(),
	y: real().notNull(),
	width: real().notNull(),
	height: real().notNull(),
});

export const friend = sqliteTable("Friend", {
	creationTime: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	user1id: text().notNull(),
	user2id: text().notNull(),
	state: text().notNull().default("PENDING")
}, (table) => [
	uniqueIndex("users").on(table.user1id, table.user2id)
])

export const notification = sqliteTable("Notification", {
	creationTime: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	id: text().notNull().primaryKey(),
	recipient: text().notNull(),
	type: text().notNull(),
	friendId: text() 
})

export const user = sqliteTable("User", {
	id: text().primaryKey().notNull(),
	name: text(),
	admin: numeric().notNull(),
	email: text().notNull(),
	createdAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
	(table) => [
		uniqueIndex("User_email").on(table.email),
		uniqueIndex("Username").on(table.name)
	]);

export const otpCode = sqliteTable("OtpCode", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	codeHash: text().notNull(),
	expiresAt: integer().notNull(),
	used: numeric().notNull(),
	createdAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const session = sqliteTable("Session", {
	id: text().primaryKey().notNull(),
	userId: text().notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	expiresAt: integer().notNull(),
});

export const notificationRelations = relations(notification, ({ one }) => ({
	friend: one(user, {
		fields: [notification.friendId],
		references: [user.id]
	}),
}));
export const friendRelations = relations(friend, ({ one }) => ({
	user1: one(user, {
		relationName: "user1",
		fields: [friend.user1id],
		references: [user.id]
	}),
	user2: one(user, {
		relationName: "user2",
		fields: [friend.user2id],
		references: [user.id]
	}),
}));

export const rectRelations = relations(rect, ({ one }) => ({
	image: one(image, {
		fields: [rect.id],
		references: [image.id]
	}),
}));
export const leaderboardRelations = relations(leaderboard, ({ one }) => ({
	user: one(user, {
		fields: [leaderboard.userId],
		references: [user.id]
	}),
}));

export const imageRelations = relations(image, ({ one }) => ({
	rect: one(rect),
}));

export const mapRelations = relations(map, ({ one, many }) => ({
	places: many(mapPlace),
	createdBy: one(user, {
		fields: [map.createdBy],
		references: [user.id]
	})
}));

export const mapPlaceRelations = relations(mapPlace, ({ one }) => ({
	image: one(image, {
		fields: [mapPlace.imageId],
		references: [image.id]
	}),
	map: one(map, {
		fields: [mapPlace.mapId],
		references: [map.id]
	})
}))

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	maps: many(map),
	friends1: many(friend,{relationName: "user1"}),
	friends2: many(friend,{relationName: "user2"})
}));
