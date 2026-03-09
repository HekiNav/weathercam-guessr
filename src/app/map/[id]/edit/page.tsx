"use server"

import { editMap } from "@/app/actions/map"
import { MapEditingUi } from "../../new/page"
import { getMap } from "@/lib/public"
import Toast from "@/components/toast"
import { Image } from "@/app/actions/image"

export default async function MapEditUi({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const map = await getMap(id)
    if (!map) return (
        <>
            <Toast type="error" message={`Could not access map with id ${id}. It may not exist, or you may not have access to it.`}></Toast>
        </>
    )

    return <MapEditingUi saveFunc={editMap} {...map} images={map.places?.reduce((prev,curr) => (curr.image ? [...prev, {...curr.image, time: curr.time}] : prev), new Array<Image & {time?: number}>())}/>
}