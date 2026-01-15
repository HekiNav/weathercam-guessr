"use client"
import UserUI from "@/components/user";
import { UserContext } from "@/app/user-provider";
import { redirect } from "next/navigation";
import { useContext, useEffect } from "react";
import { setToastCookie } from "@/app/actions/toast";
import toast from "react-hot-toast";

export default function MyUserPage() {
    const user = useContext(UserContext)
    if (!user) {
        useEffect(() => {
            toast("Log in first")
            redirect("/login?to=/user/me")
        })
        return <div></div>
    }
    return (
        <div>
            <UserUI user={user}></UserUI>
        </div>
    )
}