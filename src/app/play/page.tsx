"use server"

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/dist/server/api-utils"

export default function PlayPage() {
    const user = getCurrentUser()
    if (!user) redirect("/login?from")
}