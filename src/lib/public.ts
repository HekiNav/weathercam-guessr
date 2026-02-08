"use server"
import { session, user } from "@/db/schema"
import { createDB } from "./db"
import { desc, eq, or } from "drizzle-orm"
import { Friend, User } from "./definitions"
import MiniSearch from "minisearch"

// public data functions for users
export async function getUser(identifier: string) {
    const db = await createDB()
    const data = await db.query.user.findFirst({
        where: or(eq(user.id, identifier), eq(user.name, identifier)),
        with: {maps: true, sessions: {limit: 1, orderBy: desc(session.expiresAt)}, friends1: {with: {user1: true, user2: true}}, friends2: {with:{user1: true, user2: true}}}
    })
    if (!data) return null
    // redact email, also booleans are stored as strings in the db
    return {...data, email: "N/A", admin: data.admin == "true", lastSeen: data.sessions[0].expiresAt, friends: [...data.friends1, 
        ...data.friends2.map(f => ({...f, user1: {...f.user1, admin: f.user1.admin == "true"}, user2: {...f.user2, admin: f.user2.admin == "true"}}))] as Friend[]}
}
let users: User[]|null = null
const minisearch = new MiniSearch({
    fields: ["name", "id"],
    storeFields: ["name", "id", "admin", "email", "friends", "createdAt"],
})
export async function searchUser(query: string): Promise<User[]> {
    const db = await createDB()
    if (!users || !users.length) {
        users = (await db.query.user.findMany({with: {friends1: true, friends2: true}})).map(f => ({...f, admin: f.admin == "true", email: "N/A", friends: [...f.friends1, ...f.friends2] as Friend[]}))
        await minisearch.addAllAsync(users)
    }
    console.log(users)
    return minisearch.search(query, {
        fuzzy: 0.6,
    }) as never
}