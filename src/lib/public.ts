import { user } from "@/db/schema"
import { createDB } from "./db"
import { eq, or } from "drizzle-orm"

// public data functions for users
export async function getUser(identifier: string) {
    const db = createDB()

    return (await db).select({}).from(user).where(or(eq(user.id, identifier), eq(user.name, identifier)))
}