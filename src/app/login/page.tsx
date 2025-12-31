"use client";

import { useActionState, useState } from "react";
import { sendOtp } from "@/app/actions/login";
import { verifyOtp } from "@/app/actions/verify-otp";
import Card from "../ui/card";

export default function Login() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")

  const [state, action, pending] = useActionState(login)

  return (
    <div className="w-full h-full flex items-center grow justify-center">
      <Card title="Login">

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

                const { errors, state } = await sendOtp(email)
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
      </Card>

    </div>

  )
}
