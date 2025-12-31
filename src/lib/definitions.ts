import * as z from 'zod'
 
export const EmailSchema = z.email({ error: 'Please enter a valid email.' }).trim()
 
export type FormState<K extends readonly string[]> =
  | {
      errors?: {
        [P in K[number]]?: string[]
      }
      step?: string
    }
  | undefined
export type OTPFormState = FormState<["email", "otp"]>