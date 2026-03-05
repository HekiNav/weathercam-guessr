"use server"
import { map, mapPlace } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { createDB } from "@/lib/db";
import { FormState, ImageOrder, MapVisibility, NotificationType } from "@/lib/definitions";
import { sendNotification } from "@/lib/notification";
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
    })).min(1, { error: "Please add at least one image" }).max(50, { error: "Please add a maximum of 50 images" })
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

    const user = await getCurrentUser(true)

    if (!user) {
        redirect("/login?to=/map/new")
    }

    if (!success) {
        // @ts-expect-error foo
        const errs: MapCreationErrors = Object.entries(z.treeifyError(error).properties || {}).reduce((p, [k, v]) => ({ ...p, [k]: v[k == "images" ? "items" : "errors"] }), {})
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
    await db.insert(map).values({
        id: mapId,
        name: data.name,
        createdById: user.id,
        imageGeojsonAvailable: data.geojson ? "true" : "false",
        imageLocationBlurred: data.blur ? "true" : "false",
        order: data.order,
        visibility: data.visibility
    })

    // @ts-expect-error  Zod verifies images length to be at least 1
    await db.batch([
        ...(data.images.map(i =>
            db.insert(mapPlace).values({
                imageId: i.image,
                index: i.index,
                mapId: mapId,
                time: i.time
            }))
        )
    ])

    if (data.visibility == MapVisibility.FRIENDS || data.visibility == MapVisibility.PUBLIC) {
        console.log("jdjkdjk")
        user.friends?.forEach(f => {
            const friend = f.user1id == user.id ? f.user2 : f.user1
            console.log(friend)
            if (friend) sendNotification({
                message: `
                <h1>User ${user.name} has just created a new msap called ${data.name}!</h1>
                <a href="/map/${mapId}"><button class="bg-green-600 cursor-pointer rounded shadow-xl/20 p-2">View</button></a>
                `,
                type: NotificationType.TEXT,
                recipient: friend.id,
                title: `${user.name?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} has created a new map!`
            })
        })
    }

    return {
        step: "success",
        mapId: mapId
    }
}