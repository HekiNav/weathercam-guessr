"use client"
import { User } from "@/lib/definitions";
import { createContext, PropsWithChildren } from "react";

export interface userProviderProps extends PropsWithChildren { user: User | null }

export const UserContext = createContext<User | null>(null)

export default function UserProvider({ user, children }: userProviderProps) {
    return (
        <UserContext value={user}>
            {children}
        </UserContext>
    )
}