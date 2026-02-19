"use client"
import { Notification, User } from "@/lib/definitions";
import { getNotifications } from "@/lib/notification";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
export interface userProviderProps extends PropsWithChildren { user: User | null, notifs: Notification[] | null }

export const UserContext = createContext<User | null>(null)
export const NotificationContext = createContext<[Notification[]| null, (() => void) | null]>([null, null])

export default function UserProvider({ user, children, notifs }: userProviderProps) {
    const [lastUpdateTime, setLastUpdateTime] = useState(0)
    const [notifications, setNotifications] = useState(notifs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (lastUpdateTime != 0) return
        setLastUpdateTime(Date.now())
        setTimeout(updateNotifs, 300_000)
    })
    function updateNotifs() {
        if (!user) return
        getNotifications({ user: user?.id }).then(newNotifs => {
            setNotifications(newNotifs.map(n => ({ ...n, read: n.read == "true" })))
            setLastUpdateTime(Date.now())
        })
    }
    return (
        <UserContext value={user}>
            <NotificationContext value={[notifications, updateNotifs]}>
                {children}
            </NotificationContext>
        </UserContext>
    )
}