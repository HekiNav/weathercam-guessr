"use server"

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { gameModes } from "@/lib/definitions"
import Card from "@/components/card"
import PlaceholderImage from "@/components/placeholderimage"
import Button from "@/components/button"
import Link from "next/link"

export default async function PlayPage() {
    const user = await getCurrentUser()
    if (!user) redirect("/login?to=/play")

    return (
        <div className="p-4 h-full">
            <h1 className="text-5xl font-mono text-green-600">
                Play
            </h1>
            <div className="flex flex-row overflow-y-scroll gap-2 p-10">
                {...gameModes.map((m) => (
                    <Card imageCard title={m.name} className="items-start w-50!">
                        <div className="flex flex-col justify-between h-full grow">
                            <div className="flex flex-col mt-1">
                                <PlaceholderImage />
                                <div className="px-2 font-medium">
                                    {m.description}
                                </div>

                            </div>
                            <div className="flex flex-col w-full items-center mt-2">
                                {m.available ? <Link href={`/play/${m.id}/`}><Button>Play</Button></Link> : <Button disabled>Coming soon</Button>}
                            </div>
                        </div>

                    </Card>
                ))}
            </div>
        </div>
    )
}