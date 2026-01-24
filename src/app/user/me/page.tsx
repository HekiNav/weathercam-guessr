"use client"
import UserUI from "@/components/user";
import { UserContext } from "@/app/user-provider";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/button";

export default function MyUserPage() {
    const user = useContext(UserContext)
    useEffect(() => {
        if (user) return
        toast("Log in first")
        redirect("/login?to=/user/me")
    })

    const [email, setEmail] = useState(user?.email)
    const [username, setUsername] = useState(user?.name || "")

    if (!user) {
        return <div></div>
    }
    return (
        <div>
            <UserUI user={user}></UserUI>
            <div className="p-4">
                <h1 className="text-lg text-green-600 font-medium mb-4">Edit details</h1>
                <label htmlFor="email">Update email</label><br />
                <input
                    placeholder="Email"
                    autoComplete="email"
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="my-1 border-black border-3 rounded p-1 text-green-600"
                    onKeyDown={(e) => e.key == "Enter"}
                />
                <Button className="ml-2 mb-4">Update</Button><br />
                <label htmlFor="email">Update username</label><br />
                <input
                    placeholder="Username"
                    autoComplete="email"
                    type="email"
                    id="email"
                    name="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="my-1 border-black border-3 rounded p-1 text-green-600"
                    onKeyDown={(e) => e.key == "Enter"}
                />
                <Button className="ml-2 mb-4">Update</Button>
                <h1 className="text-lg text-red-600 font-medium my-4">Delete account</h1>
                <Button className="bg-red-600">Delete</Button>
            </div>
        </div>
    )
}