"use client";

import {useRouter } from "next/navigation";
import { logout } from "../actions/logout";
import Card from "../../components/card";
import { useContext } from "react";
import { UserContext } from "../user-provider";
import Button from "../../components/button";

export default function Logout() {
  const router = useRouter()

  const user = useContext(UserContext)

  if (!user?.id) router.back()

  return (
    <div className="w-full h-full flex items-center grow justify-center">
      <Card cardTitle="Logout">
        <h1 className="text-xl mt-2 mb-6">Are you sure you want to log out?</h1>
        <div>
          <Button className="bg-red-600 mr-2" onClick={() => {
            router.back()
          }}>Cancel</Button>
          <Button onClick={() => {
            logout()
            router.push("/")
            router.refresh()
          }}>Confirm</Button>
        </div>
      </Card>

    </div>

  )
}
