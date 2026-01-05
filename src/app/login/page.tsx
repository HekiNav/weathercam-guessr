"use client";

import { startTransition, useActionState, useContext, useEffect, useState } from "react";
import { login } from "@/app/actions/login";
import Card from "../ui/card";
import { OTPFormState } from "@/lib/definitions";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { UserContext } from "../user-provider";
import Button from "../ui/button";

export default function Login() {

  const params = useSearchParams()

  const successPath = params.get("to") || "/"

  const user = useContext(UserContext)

  const [email, setEmail] = useState(user?.email || "")
  const [otp, setOtp] = useState("")
  const [username, setUsername] = useState(user?.name || "")

  const [{ step, errors }, action, pending] = useActionState(login, { step:  (user?.id && !user?.name) ? "username" : "email" } as OTPFormState)

  const router = useRouter()

  if (user?.id) {
    if (user.name) redirect(successPath)
  }
  useEffect(() => {
    if (step == "success") router.push(successPath)
  }, [step])

  return (
    <div className="w-full h-full flex items-center grow justify-center">
      <Card title="Login using OTP">

        {step === "email" && (
          <>
            <h1 className="text-md max-w-60">Enter an email address for your account.</h1>
            <input
              placeholder="Email"
              value={email}
              disabled={pending}
              onChange={(e) => setEmail(e.target.value)}
              className="my-1 border-black border-3 rounded p-1"
            />
            <div className="text-red-600">{errors?.email?.join(", ")}</div>
            <small className="text-gray-600 mb-4">Other login methods coming soon</small>
            <Button
              disabled={pending}
              onClick={() => {
                startTransition(() => action({ type: "send", email: email }))
              }}
            >
              Send code
            </Button>
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
            <div className="text-red-600">{errors?.otp?.join(", ")}</div>
            <Button
              disabled={pending}

              onClick={() => {
                startTransition(() => action({ type: "verify", email: email, otp: otp }))
              }}>
              Verify
            </Button>
          </>
        )}
        {step === "username" && (
          <>
            <h1 className="text-md max-w-60">Succesfully created account! Please enter a username to be shown instead of your user id <span className="text-green-600">{user?.id}</span></h1>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={pending}
              className="my-2 border-black border-3 rounded p-1"
            />
            <div className="text-red-600">{errors?.username?.join(", ")}</div>
            <Button
              disabled={pending}

              onClick={() => {
                startTransition(() => action({ type: "username", email: email, otp: otp, username: username }))
              }}>
              Save
            </Button>
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
