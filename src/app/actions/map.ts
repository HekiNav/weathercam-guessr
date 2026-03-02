import { map, mapPlace } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { createDB } from "@/lib/db";
import { FormState, MapType, MapVisibility } from "@/lib/definitions";
import { redirect } from "next/navigation";
import z from "zod";

export const MapCreationData = z.object({
    name: z.string().min(3).max(20),
    visibility: z.enum(MapVisibility),
    type: z.enum(MapType),
    geojson: z.boolean(),
    blur: z.boolean(),
    order: z.boolean(),
    images: z.array(z.object({
        index: z.number(),
        image: z.string(),
        time: z.number()
    })).min(1)
})
export type MapCreationDataType = z.infer<typeof MapCreationData>
export interface MapCreationState extends FormState<[]> {
    errors?: {
        name?: string[]
        visibility?: string[]
        geojson?: string[]
        blur?: string[]
        server?: string[]
        images?: {
            index?: string[],
            source?: string[],
            id?: string[],
        }[]
    }
}
export async function createMap(state: MapCreationState, submitted: MapCreationDataType): Promise<MapCreationState> {
    const {success, data, error} = z.safeParse(MapCreationData, submitted)

    const user = await getCurrentUser()

    if (!user) {
        redirect("/login?to=/map/new")
    }

    if (!success) return {
        step: "create",
        errors: Object.entries(z.treeifyError(error).properties || {}).reduce((p,[k,v]) => ({...p, [k]: v.errors}),{})
    }
    const db = await createDB()

    const mapId = crypto.randomUUID()

    db.batch([
        db.insert(map).values({
            id: crypto.randomUUID(),
            name: data.name,
            createdBy: user.id,
            imageGeojsonAvailable: data.geojson,
            imageLocationBlurred: data.blur,
            imageOrder: data.order,
            visibility: data.visibility
        }),
        ...data.images.map(i => 
            db.insert(mapPlace).values({
                imageId: i.image,
                index: i.index,
                mapId: mapId,
                time: i.time
            })
        )
    ])

    return {
        step: "success"
    }
}