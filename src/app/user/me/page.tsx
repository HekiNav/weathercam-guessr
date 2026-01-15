"use client"
import UserUI from "@/components/user";
import { UserContext } from "@/app/user-provider";
import { redirect } from "next/navigation";
import { useContext } from "react";
import { setToastCookie } from "@/app/actions/toast";

export default function MyUserPage() {
    const user = useContext(UserContext)
    if (!user) {
        setToastCookie("Log in first!")
        redirect("/login?to=/user/me")
    }
    return (
        <div>
            <UserUI user={user}></UserUI>
        </div>
    )
}