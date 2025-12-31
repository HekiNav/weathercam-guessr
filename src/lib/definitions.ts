import * as z from 'zod'
 
export const EmailSchema = z.email({ error: 'Please enter a valid email.' }).trim()
 
export type FormState<E extends readonly string[]> =
  | {
      errors?: {
        [P in E[number]]?: string[]
      }
      step?: string
    }
export type OTPFormState = FormState<["email", "otp"]>