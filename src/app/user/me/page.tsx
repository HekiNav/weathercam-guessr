"use client"
import UserUI from "@/components/user";
import { UserContext } from "@/app/user-provider";
import { redirect } from "next/navigation";
import { useContext } from "react";
import { toast } from "sonner";

export default function MyUserPage() {
    const user = useContext(UserContext)
    if (!user) {
        toast("Log in first!")
        redirect("/login?to=/user/me")
    }
    return (
        <div>
            <UserUI user={user}></UserUI>
        </div>
    )
}