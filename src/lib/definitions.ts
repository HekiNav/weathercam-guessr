import * as z from 'zod'

export const EmailSchema = z.email({ error: 'Please enter a valid email.' }).trim()
export const UsernameSchema = z.string()
  .min(6, { error: "Username must be at least 6 char longs" })
  .max(20, { error: "Username cannot exceed 20 characters" })
  .regex(
    /^[A-Za-z0-9]{6,20}$/,
    "Username must not contain special characters or uppercase letters"
  );

export type FormState<E extends readonly string[]> =
  | {
    errors?: {
      [P in E[number]]?: string[]
    }
    step?: string
  }
export type OTPFormState = FormState<["email", "otp", "username"]>