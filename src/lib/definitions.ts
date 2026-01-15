import { ReactNode } from 'react';
import * as z from 'zod'

export const EmailSchema = z.email({ error: 'Please enter a valid email.' }).trim()
export const UsernameSchema = z.string()
  .min(3, { error: "Username must be at least 3 char longs" })
  .max(20, { error: "Username cannot exceed 20 characters" })
  .regex(
    /^[A-Za-z0-9]{3,20}$/,
    "Username must not contain special characters"
  );

export type FormState<E extends readonly string[]> =
  | {
    errors?: {
      [P in E[number]]?: string[]
    }
    step?: string
  }
export type OTPFormState = FormState<["email", "otp", "username"]>

export interface User {
  id: string
  name: string | null
  admin: boolean
  email: string
  createdAt: number
  sessions?: Session[]
}


export interface Session {
  id: string
  userId: string
  expiresAt: string
}

export interface GameMode {
  id: string,
  name: ReactNode,
  description: ReactNode,
  available: boolean
}

export const gameModes: GameMode[] = [{
  id: "daily",
  name: "Daily challenge",
  description: "Play a daily game of five images",
  available: false
}, {
  id: "practice",
  name: "Practice",
  description: "Practice your skills with a customizable, endless game",
  available: true
}]

export function rib(a: number, b: number) {
  return Math.floor(Math.random() * (b - a) + a)
}