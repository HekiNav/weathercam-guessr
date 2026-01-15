"use client"
import { User } from "@/lib/definitions";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import Cookies from "js-cookie"
export interface userProviderProps extends PropsWithChildren { user: User | null }

export const UserContext = createContext<User | null>(null)

export default function UserProvider({ user, children }: userProviderProps) {
    const [toastCookie, setToastCookie] = useState(Cookies.get("toast"))

    useEffect(() => {
        console.log("TOAST CHANGE", toastCookie)
    }, [toastCookie])

    return (
        <UserContext value={user}>
            {children}
        </UserContext>
    )
}