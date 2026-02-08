import { notification } from "@/db/schema";
import { createDB } from "./db";
import { NotificationType } from "./definitions";
import { Resend } from "resend";

export interface NotificationParams {
    message: string,
    recipient: string,
    sender?: string,
    type: NotificationType,
    email?: string,
    recipientEmail?: string,
    emailSubject?: string
} 
export default async function sendNotification ({message, recipient, type, recipientEmail, email, emailSubject, sender}: NotificationParams) {
    const db = await createDB()
    await db.insert(notification).values({
        id: crypto.randomUUID(),
        recipientId: recipient,
        type: type,
        senderId: sender,
        message: message
    })
    if (!email || !recipientEmail) return
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: recipientEmail,
      subject: emailSubject || "<no subject>",
      html: email,
    })
}