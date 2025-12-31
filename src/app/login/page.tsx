"use client";

import { useActionState, useContext, useEffect, useState } from "react";
import { login } from "@/app/actions/login";
import { verifyOtp } from "@/app/actions/verify-otp";
import Card from "../ui/card";
import { OTPFormState } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { UserContext } from "../user-provider";

export default function Login() {

  const user = useContext(UserContext)

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")

  const [{ step, errors }, action, pending] = useActionState(login, { step: "email" } as OTPFormState)

  const router = useRouter()


  useEffect(() => {
    if (user?.id) router.replace("/")

    if (step == "success") router.push("/")
  }, [step])

  return (
    <div className="w-full h-full flex items-center grow justify-center">
      <Card title="Login using OTP">

        {step === "email" && (
          <>
            <input
              placeholder="Email"
              value={email}
              disabled={pending}
              onChange={(e) => setEmail(e.target.value)}
              className="my-2 border-black border-3 rounded p-1"
            />
            <button
              className="bg-green-600 rounded shadow-xl/20 p-2"
              disabled={pending}
              onClick={() => {
                console.log("sending otp!")

                action({ type: "send", email: email })
              }}
            >
              Send code
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-md max-w-60">Message sent! Check your inbox and spam for a message from <span className="text-green-600">auth@mail.hekinav.dev</span></h1>
            <input
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={pending}
              className="my-2 border-black border-3 rounded p-1"
            />
            <button
              className="bg-green-600 rounded shadow-xl/20 p-2"
              disabled={pending}

              onClick={() => {
                action({ type: "verify", email: email, otp: otp })

              }}>
              Verify
            </button>
          </>
        )}
        {step == "success" && (
          <>
            <h1 className="text-lg">Success!</h1>
          </>
        )}
      </Card>

    </div>

  )
}
