"use server";

import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { EmailSchema, OTPFormState, UsernameSchema } from "@/lib/definitions";
import z from "zod";

const resend = new Resend(process.env.RESEND_API_KEY!)

export interface OTPFormData {
  type: "send" | "verify" | "username",
  email: string,
  otp?: string,
  username?: string
}

export async function login(state: OTPFormState, { type, email, otp, username }: OTPFormData): Promise<OTPFormState> {
  if (type == "send") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const hash = crypto.createHash("sha256").update(otp).digest("hex")


    const { data, error, success } = EmailSchema.safeParse(email)


    if (!success) return {
      errors: {
        email: z.treeifyError(error).errors
      },
      step: state.step
    }

    await prisma.otpCode.create({
      data: {
        email: data,
        codeHash: hash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
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
      return {
        errors: {
          otp: ["Invalid or expired code"]
        },
        step: state?.step
      }
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
      ; (await cookies()).set("session", session.id, {
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
    if (!(await prisma.user.findFirst({where: {email: email}}))) return {
      step: "email"
    }

    const { success, error, data } = UsernameSchema.safeParse(username)

    if (!success) return {
      errors: {
        username: z.treeifyError(error).errors
      },
      step: state.step
    }

    await prisma.user.update({
      where: { email: email },
      data: { name: data }
    })
    return {
      step: "success"
    }
  }
  return {
    step: "email"
  }
}
