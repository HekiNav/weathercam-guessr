"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function verifyOtp(email: string, otp: string) {
  
}
