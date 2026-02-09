"use client"
import { User } from "@/lib/definitions";
import { createContext, PropsWithChildren } from "react";
export interface userProviderProps extends PropsWithChildren { user: User | null, notifs: Notification[] | null }

export const UserContext = createContext<User | null>(null)
export const NotificationContext = createContext<Notification[] | null>(null)

export default function UserProvider({ user, children, notifs }: userProviderProps) {
    let notifications = notifs
    let lastUpdateTime = Date.now()
    return (
        <UserContext value={user}>
            <NotificationContext value={notifications}>
                {children}
            </NotificationContext>
        </UserContext>
    )
}