"use client"
import { UserContext } from "@/app/user-provider"
import Toast from "@/components/toast"
import { redirect } from "next/navigation"
import { useContext, useEffect } from "react"
import toast from "react-hot-toast"

export default function MapCreationUi() {
    const user = useContext(UserContext)
    useEffect(() => {
        if (!user) {
            toast("Please log in before creating maps")
            redirect("/login")
        }
    })
    if (!user) return (<div></div>)

    return <>

    </>
}