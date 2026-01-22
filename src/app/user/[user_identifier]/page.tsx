"use server"

import Toast from "@/components/toast"
import UserUI from "@/components/user"
import { getUser } from "@/lib/public"

export default async function UserPage({ params }: { params: Promise<{ user_identifier: string }> }) {

    const { user_identifier } = await params


    const user = await getUser(user_identifier)
    
    if (!user) return <div><Toast type="error" message={`Could not find user with id or name ${user_identifier}`}></Toast></div>

    return (
        <div>
            <UserUI user={{ ...user, email: "", admin: user.admin }}></UserUI>
        </div>
    )
}