"use client"
import { PropsWithChildren, useEffect } from "react";
import { toast } from "sonner";

export interface ToastProps extends PropsWithChildren {
    type?: "error" | "info" | "warning",
}

export default function Toast({ children, type }: ToastProps) {
    useEffect(() => {
        if (type) toast[type](children)
        else toast(children)
    })

    return (
        <></>
    )
}