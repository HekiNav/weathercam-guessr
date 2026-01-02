import { cookies } from "next/headers";

export async function setToastCookie(message: string, type?: "error" | "success" | "warning") {
    (await cookies()).set("toast", JSON.stringify({message, type}), {maxAge: 5})

}