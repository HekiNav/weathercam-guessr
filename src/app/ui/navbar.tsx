"use client"
import { useContext } from "react"
import { UserContext } from "../user-provider"
import IconItem from "./iconitem"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

export default function NavBar() {
    const user = useContext(UserContext)
    console.log(user)
    return (
        <div className="shadow-lg/20 w-full flex flex-row justify-between p-2 items-center font-sans">
            <div className="flex flex-row w-full h-min divide-green-600 divide-x-2 font-medium">
                <div className="px-1">Home</div>
                <div className="px-1">Play</div>
            </div>
            <div>
                {user ?
                    <div className="flex flex-row flex-nowrap gap-2">
                        <IconItem icon={{ icon: faUser, title: user.admin ? "Admin user" : "Normal user", className:`${user.admin ?  "text-red-600" : "text-green-600"}` }}>{user.name || user.id}</IconItem>
                        <Link href="/logout" className="text-nowrap">
                            <button className="px-2 py-1 rounded bg-green-600 shadow-lg/20 font-medium">Log out</button>
                        </Link>
                    </div> :
                    <Link href="/login" className="text-nowrap">
                        <button className="px-2 py-1 rounded bg-green-600 shadow-lg/20 font-medium">Log in</button>
                    </Link>
                }
            </div>
        </div>
    )
}