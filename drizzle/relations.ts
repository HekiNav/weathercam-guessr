import { relations } from "drizzle-orm/relations";
import { image, rect, user, session } from "./schema";

export const rectRelations = relations(rect, ({one}) => ({
	image: one(image, {
		fields: [rect.id],
		references: [image.id]
	}),
}));

export const imageRelations = relations(image, ({many}) => ({
	rects: many(rect),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
}));