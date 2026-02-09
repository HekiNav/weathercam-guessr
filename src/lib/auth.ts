import { cookies } from "next/headers";
import { createDB } from "./db";
import { session } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { Friend, Map, User } from "./definitions";

export async function getCurrentUser(details = false): Promise<User | null> {
  const db = createDB()

  const sessionId = (await cookies()).get("session")?.value
  if (!sessionId) return null;

  const sessionData = await (await db).query.session.findFirst({
     where: and(eq(session.id, sessionId), gt(session.expiresAt, Date.now())), with: { user: details ? {with: {maps: true, friends1: {with: {user1: true, user2: true}}, friends2: {with: {user1: true, user2: true}}}} : true}
    })

  return sessionData?.user ? { ...sessionData?.user, admin: sessionData?.user.admin == "true", lastSeen: sessionData.expiresAt, maps: sessionData.user.maps as Map[], friends: [...sessionData.user.friends1 || [], 
          ...sessionData.user.friends2 || []].map(f => ({...f, user1: {...f.user1, admin: f.user1.admin == "true"}, user2: {...f.user2, admin: f.user2.admin == "true"}})) as Friend[] } : null
}
