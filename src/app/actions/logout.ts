"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function logout() {
  const sessionId = (await cookies()).get("session")?.value

  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } });
  }

  (await cookies()).delete("session");
}
