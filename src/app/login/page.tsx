"use client";

import { useState } from "react";
import { sendOtp } from "@/app/actions/send-otp";
import { verifyOtp } from "@/app/actions/verify-otp";

export default function Login() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")

  return (
    <div>
      {step === "email" && (
        <>
          <input
            placeholder="email here"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={async () => {
              console.log("sending otp!")

              await sendOtp(email);
              console.log("otp done!")
              setStep("otp");
            }}
          >
            Send code
          </button>
        </>
      )}

      {step === "otp" && (
        <>
          <input
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={async () => {
            const response = await verifyOtp(email, otp)
            console.log(response)
          }}>
            Verify
          </button>
        </>
      )}
    </div>
  )
}
