"use server"
import { map, mapPlace } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { createDB } from "@/lib/db";
import { FormState, ImageOrder, MapVisibility } from "@/lib/definitions";
import { redirect } from "next/navigation";
import z from "zod";

const MapCreationData = z.object({
    name: z.string().min(3).max(20),
    visibility: z.enum(MapVisibility),
    geojson: z.boolean(),
    blur: z.boolean(),
    order: z.enum(ImageOrder),
    images: z.array(z.object({
        index: z.number(),
        image: z.string(),
        time: z.number()
    })).min(1, {error: "Please add at least one image"}).max(50, {error: "Please add a maximum of 50 images"})
})
export type MapCreationDataType = z.infer<typeof MapCreationData>
interface MapCreationErrors {
    name?: string[];
    visibility?: string[];
    geojson?: string[];
    blur?: string[];
    server?: string[];
    order?: string[];
    images?: {
        index?: string[];
        time?: string[];
        id?: string[];
    }[];
}

export interface MapCreationState extends FormState<[]> {
    mapId?: string,
    errors?: MapCreationErrors
}
export async function createMap(state: MapCreationState, submitted: MapCreationDataType): Promise<MapCreationState> {
    const { success, data, error } = z.safeParse(MapCreationData, submitted)

    const user = await getCurrentUser()

    if (!user) {
        redirect("/login?to=/map/new")
    }

    if (!success) {
        // @ts-expect-error foo
        const errs: MapCreationErrors = Object.entries(z.treeifyError(error).properties || {}).reduce((p,[k,v]) => ({...p, [k]: v[k == "images" ? "items" : "errors"]}),{})
        console.log(z.treeifyError(error).properties)
        return {
            step: "create",
            errors: {
                ...errs,
                server: [...(errs.server || []), ...(z.treeifyError(error).errors || []), ...(z.treeifyError(error).properties?.images?.errors || [])]
            }
        }
    }
    const db = await createDB()

    const mapId = crypto.randomUUID()

    await db.batch([
        db.insert(map).values({
            // @ts-expect-error bugged id
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
        step: "success",
        mapId: mapId
    }
}