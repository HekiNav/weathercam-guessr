import { NotificationType } from "./definitions";

export interface NotificationParams {
    message: string,
    recipient: string,
    sender?: string,
    type: NotificationType,
    email?: string
} 
export default function sendNotification ({message, recipient, type, email, sender}: NotificationParams) {
    
}