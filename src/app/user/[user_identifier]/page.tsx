"use server"

import { getUser } from "@/lib/public"
import { redirect } from "next/navigation"

export default async function UserPage({params}: {params: Promise<{user_identifier: string}>}) {

    const {user_identifier} = await params

    const user = await getUser(user_identifier)

    if (!user) redirect("/user/me")

    return (
        <div>
            {user?.name} {user?.id} {user?.createdAt.toISOString()}
        </div>
    )
}