import { sqliteTable, integer, text, numeric, uniqueIndex, real } from "drizzle-orm/sqlite-core"
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

export const rect = sqliteTable("Rect", {
	id: text().primaryKey().notNull().references(() => image.id, { onDelete: "restrict", onUpdate: "cascade" }),
	x: real().notNull(),
	y: real().notNull(),
	width: real().notNull(),
	height: real().notNull(),
});

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


export const rectRelations = relations(rect, ({ one }) => ({
	image: one(image, {
		fields: [rect.id],
		references: [image.id]
	}),
}));

export const imageRelations = relations(image, ({ one }) => ({
	rect: one(rect),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
}));
