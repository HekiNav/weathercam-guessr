import { cookies } from "next/headers";
import { createPrismaClient } from "@/lib/prisma";

export async function getCurrentUser() {
  const prisma = createPrismaClient()
  
  const sessionId = (await cookies()).get("session")?.value
  if (!sessionId) return null;

  const session = await (await prisma).session.findFirst({
    where: {
      id: sessionId,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  })

  return session?.user ?? null
}
