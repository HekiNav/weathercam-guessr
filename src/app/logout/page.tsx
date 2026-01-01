"use client";

import {useRouter } from "next/navigation";
import { logout } from "../actions/logout";
import Card from "../ui/card";
import { useContext } from "react";
import { UserContext } from "../user-provider";

export default function Logout() {
  const router = useRouter()

  const user = useContext(UserContext)

  if (!user?.id) router.back()

  return (
    <div className="w-full h-full flex items-center grow justify-center">
      <Card title="Logout">
        <h1 className="text-xl mt-2 mb-6">Are you sure you want to log out?</h1>
        <div>
          <button className="bg-red-600 p-2 rounded shadow-xl/20 mr-2" onClick={() => {
            router.back()
          }}>Cancel</button>
          <button className="bg-green-600 p-2 rounded shadow-xl/20" onClick={() => {
            logout()
            router.push("/")
          }}>Confirm</button>
        </div>
      </Card>

    </div>

  )
}
