"use client"
import { Notification, User } from "@/lib/definitions";
import { getNotifications } from "@/lib/notification";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
export interface userProviderProps extends PropsWithChildren { user: User | null, notifs: Notification[] | null }

export const UserContext = createContext<User | null>(null)
export const NotificationContext = createContext<Notification[] | null>(null)

export default function UserProvider({ user, children, notifs }: userProviderProps) {
    const [lastUpdateTime, setLastUpdateTime] = useState(0)
    const [notifications, setNotifications] = useState(notifs)
    useEffect(() => {
        console.log("agag")
        if (lastUpdateTime != 0) return
        setLastUpdateTime(Date.now())
        setTimeout(() => {
            if (Date.now() - lastUpdateTime < 30_000 || !user) return
            getNotifications({ user: user?.id }).then(newNotifs => {
                setNotifications(newNotifs.map(n => ({ ...n, read: n.read == "true" })))
                setLastUpdateTime(Date.now())
            })
        }, 300_000)
    }, [lastUpdateTime, user])

    return (
        <UserContext value={user}>
            <NotificationContext value={notifications}>
                {children}
            </NotificationContext>
        </UserContext>
    )
}