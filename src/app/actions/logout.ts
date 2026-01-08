"use server";

import { session } from "@/db/schema";
import { createDB } from "@/lib/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";


export async function logout() {
  const db = createDB()
  
  const sessionId = (await cookies()).get("session")?.value

  if (sessionId) {
    await (await db).delete(session).where(eq(session.id, sessionId))
  }

  (await cookies()).delete("session");
}
