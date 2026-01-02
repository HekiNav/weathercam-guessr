"use server"

import { setToastCookie } from "@/app/actions/toast"
import Toast from "@/app/ui/toast"
import UserUI from "@/app/ui/user"
import { getUser } from "@/lib/public"
import { redirect } from "next/navigation"

export default async function UserPage({ params }: { params: Promise<{ user_identifier: string }> }) {

    const { user_identifier } = await params


    const user = await getUser(user_identifier)

    if (!user) {
        return (
            <div>
                <Toast type="error">Could not find user with id or name {user_identifier}</Toast>
            </div>
        )
    }
    return (
        <div>
            <UserUI user={{...user, email: ""}}></UserUI>
        </div>
    )
}