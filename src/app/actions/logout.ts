"use server";

import { createPrismaClient } from "@/lib/prisma";
import { cookies } from "next/headers";


export async function logout() {
  const prisma = createPrismaClient()
  
  const sessionId = (await cookies()).get("session")?.value

  if (sessionId) {
    await (await prisma).session.delete({ where: { id: sessionId } });
  }

  (await cookies()).delete("session");
}
