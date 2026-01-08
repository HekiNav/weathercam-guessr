import { cookies } from "next/headers";
import { createDB } from "./db";
import { session } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function getCurrentUser() {
  const db = createDB()
  
  const sessionId = (await cookies()).get("session")?.value
  if (!sessionId) return null;

  const sessionData = await (await db).query.user.findFirst({where: and(eq(session.id, sessionId), gt(session.expiresAt, new Date().toISOString()))})

  return sessionData ?? null
}
