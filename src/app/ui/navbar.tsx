"use client"
import { ReactNode, useContext } from "react"
import { UserContext } from "../user-provider"
import IconItem from "./iconitem"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

export default function NavBar() {
    const user = useContext(UserContext)

    const items: {url: string, item: ReactNode}[] = [
        { url: "/play", item: "Play" },
        { url: "https://github.com/HekiNav/weathercam-guessr", item: "GitHub" },

    ]
    if (user?.admin) items.splice(items.length-1, 0, { url: "/review", item: (<span className="text-red-600">Review</span>) })

    return (
        <div className="shadow-lg/20 w-full flex flex-row justify-between p-2 items-center font-sans">
            <div className="flex flex-row w-full h-min font-medium">
                <Link href="/" className="font-mono pr-4 text-green-600">Weathercam-guessr</Link>
                <div className="divide-x-2 divide-green-600">
                    {...items.map(({ url, item }) => (
                        <Link href={url} className="px-1">{item}</Link>
                    ))}
                </div>

            </div>
            <div>
                {user ?
                    <div className="flex flex-row flex-nowrap gap-2 items-center ">
                        <Link href="/user/me" className="h-full flex flex-col content-center">
                            <IconItem icon={{ icon: faUser, title: user.admin ? "Admin user" : "Normal user", className: `${user.admin ? "text-red-600" : "text-green-600"}` }}>{user.name || user.id}</IconItem>
                        </Link>
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