"use server";

import crypto from "crypto";
import { Resend } from "resend";
import { cookies } from "next/headers";
import { EmailSchema, OTPFormState, UsernameSchema } from "@/lib/definitions";
import z from "zod";
import { createDB } from "@/lib/db";
import { otpCode, session, user } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY!)

export interface OTPFormData {
  type: "send" | "verify" | "username",
  email: string,
  otp?: string,
  username?: string
}
export async function makeHash(text: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", Buffer.from(text)))).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function login(state: OTPFormState, { type, email, otp, username }: OTPFormData): Promise<OTPFormState> {
  const db = await createDB()
  if (type == "send") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const hash = await makeHash(otp)


    const { data, error, success } = EmailSchema.safeParse(email)


    if (!success) return {
      errors: {
        email: z.treeifyError(error).errors
      },
      step: state.step
    }

    await db.insert(otpCode).values({
      email: data,
      codeHash: hash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      used: "false",
      id: crypto.randomUUID()
    })
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
    return {
      step: "otp"
    }
  } else if (type == "verify") {
    if (!otp) return {
      step: state?.step,
      errors: {
        otp: ["Empty code"]
      }
    }

    const hash = await makeHash(otp)


    const record = await db.query.otpCode.findFirst({
      where: and(
        eq(otpCode.email, email),
        eq(otpCode.codeHash, hash),
        eq(otpCode.used, "false"),
        gt(otpCode.expiresAt, new Date().toISOString()),
      )
    })

    if (!record) {
      return {
        errors: {
          otp: ["Invalid or expired code"]
        },
        step: state?.step
      }
    }

    await db.update(otpCode).set({ used: "true" }).where(eq(otpCode.id, record.id))

    const userData =
      (await db.query.user.findFirst({ where: eq(user.email, email) })) ??
      (await db.insert(user).values({ email: email, admin: "false", id: crypto.randomUUID() }).returning())[0];
    // create session
    const sessionData = (await db.insert(session).values({
      userId: userData.id,
      id: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }).returning())[0]
      // dang parentheses ruining things
      ; (await cookies()).set("session", sessionData.id, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      })
    if (!user.name) return {
      step: "username"
    }
    else return {
      step: "success"
    }
  } else if (type == "username") {
    if (!(await db.query.user.findFirst({ where: eq(user.email, email) }))) return {
      step: "email"
    }

    const { success, error, data } = UsernameSchema.safeParse(username)

    if (!success) return {
      errors: {
        username: z.treeifyError(error).errors
      },
      step: state.step
    }

    await db.update(user).set({name: data}).where(eq(user.email, email))

    return {
      step: "success"
    }
  }
  return {
    step: "email"
  }
}
