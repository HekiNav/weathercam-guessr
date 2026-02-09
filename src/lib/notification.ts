"use server"
import { notification } from "@/db/schema";
import { createDB } from "./db";
import { NotificationType } from "./definitions";
import { Resend } from "resend";
import { eq } from "drizzle-orm";

export interface NotificationParams {
    message: string,
    recipient: string,
    sender?: string,
    type: NotificationType,
    email?: string,
    recipientEmail?: string,
    title: string
}
export async function getNotifications({ user }: { user: string }) {
    const db = await createDB()
    return await db.query.notification.findMany({
        where: eq(notification.recipientId, user)
    })
}
export async function sendNotification({ message, recipient, type, recipientEmail, email, title, sender }: NotificationParams) {
    const db = await createDB()
    await db.insert(notification).values({
        id: crypto.randomUUID(),
        recipientId: recipient,
        type: type,
        senderId: sender,
        message: message,
        title: title
    })
    if (!email || !recipientEmail) return
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: recipientEmail,
        subject: title || "<no subject>",
        html: email,
    })
}