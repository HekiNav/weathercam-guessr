"use server"

import { setToastCookie } from "@/app/actions/toast"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export async function ToastCookieSetter(props: { message: string, type?: "error" | "success" | "warning", redirect?: string }) {
    useEffect(() => {
        setToastCookie(props.message, props.type)
        if (props.redirect) redirect(props.redirect)
    })

    return (
        <div></div>
    )
}