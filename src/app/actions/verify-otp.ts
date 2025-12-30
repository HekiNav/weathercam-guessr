"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function verifyOtp(email: string, otp: string) {
  const hash = crypto.createHash("sha256").update(otp).digest("hex")

  const record = await prisma.otpCode.findFirst({
    where: {
      email,
      codeHash: hash,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!record) {
    throw new Error("Invalid or expired code")
  }

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { used: true },
  })

  const user =
    (await prisma.user.findUnique({ where: { email } })) ??
    (await prisma.user.create({ data: { email } }));

  // create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  // dang parentheses ruining things
  ;(await cookies()).set("session", session.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })
}
