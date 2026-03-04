"use server"

import Card from "@/components/card"
import Toast from "@/components/toast"
import { getMap } from "@/lib/public"
import moment from "moment"
import Link from "next/link"

export default async function MapPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const map = await getMap(id)

    if (!map) return (
        <>
            <Toast type="error" message={`Could not find map with id ${id}`}></Toast>
        </>
    )
    console.log(map)
    return (
        <div className="h-full w-full flex items-center justify-center">
            <Card className="w-8/10! h-6/10! items-start" cardTitle={map.name || "unnamed map"}>
                <div className="px-4">
                    A map by <Link className="text-green-600 underline" href={`/user/${map.createdBy?.id || ""}`}>{map.createdBy?.name}</Link> &middot; 
                    Created {moment(new Date(map.creationTime).getTime() - new Date().getTimezoneOffset() * 60_000).fromNow()} &middot;
                    last edited {moment(new Date(map.updateTime).getTime() - new Date().getTimezoneOffset() * 60_000).fromNow()}
                    
                </div>
            </Card>
        </div>
    )
}