"use server"

import { setToastCookie } from "@/app/actions/toast"
import Toast from "@/app/ui/toast"
import { getUser } from "@/lib/public"
import { redirect } from "next/navigation"

export default async function UserPage({ params }: { params: Promise<{ user_identifier: string }> }) {

    const { user_identifier } = await params


    const user = await getUser(user_identifier)

    console.log(user)

    if (!user) {
        return (
            <div>
                <Toast type="error">Could not find user with id or name {user_identifier}</Toast>
            </div>
        )
    }



    return (
        <div>
            {user?.name} {user?.id} {user?.createdAt.toISOString()}
        </div>
    )
}