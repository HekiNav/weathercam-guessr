import { session, user } from "@/db/schema"
import { createDB } from "./db"
import { desc, eq, or } from "drizzle-orm"

// public data functions for users
export async function getUser(identifier: string) {
    const db = await createDB()
    const data = await db.query.user.findFirst({
        where: or(eq(user.id, identifier), eq(user.name, identifier)),
        with: {maps: true, sessions: {limit: 1, orderBy: desc(session.expiresAt)}}
    })
    if (!data) return null
    return {...data, email: "N/A", admin: data.admin == "true", lastSeen: data.sessions[0].expiresAt}
}