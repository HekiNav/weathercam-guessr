"use server"

import UserUI from "@/components/user"
import { getUser } from "@/lib/public"
import { useEffect } from "react"
import toast from "react-hot-toast"

export default async function UserPage({ params }: { params: Promise<{ user_identifier: string }> }) {

    const { user_identifier } = await params


    const user = await getUser(user_identifier)
    useEffect(() => {
        if (user) return
        toast.error(`Could not find user with id or name ${user_identifier}`)
    })
    if (!user) return <div></div>

    return (
        <div>
            <UserUI user={{ ...user, email: "", admin: user.admin }}></UserUI>
        </div>
    )
}