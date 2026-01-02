"use server"

import { redirect } from "next/navigation"


export default async function UserPage() {
    redirect("/user/me")
}