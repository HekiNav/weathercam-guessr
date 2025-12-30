"use server";

import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendOtp(email: string) {
    console.log(email)
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const hash = crypto.createHash("sha256").update(otp).digest("hex")

  console.log(hash)

  await prisma.otpCode.create({
    data: {
      email,
      codeHash: hash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })
  console.log(`generated otp for ${email}`)
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: "Your login code",
    html: `
      <p>Your login code:</p>
      <h2>${otp}</h2>
      <p>Expires in 10 minutes.</p>
    `,
  })
}
