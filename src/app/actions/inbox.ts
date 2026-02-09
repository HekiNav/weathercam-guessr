"use server"
import { notification } from "@/db/schema";
import { createDB } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function markAsRead(notifId: string) {
    const db = await createDB()
    await db.update(notification).set({read: "true"}).where(eq(notification.id, notifId))
}