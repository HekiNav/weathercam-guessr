"use server"
import { map, mapPlace } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { createDB } from "@/lib/db";
import { FormState, ImageOrder, MapVisibility, NotificationType, objectMatch } from "@/lib/definitions";
import { sendNotification } from "@/lib/notification";
import { and, eq } from "drizzle-orm";
import { BatchItem } from "drizzle-orm/batch";
import { redirect } from "next/navigation";
import z from "zod";

const MapEditingData = z.object({
    name: z.string().min(3).max(20),
    id: z.string().optional(),
    visibility: z.enum(MapVisibility),
    geojson: z.boolean(),
    blur: z.boolean(),
    order: z.enum(ImageOrder),
    roundLimit: z.number(),
    images: z.array(z.object({
        index: z.number(),
        image: z.string(),
        time: z.number()
    })).min(1, { error: "Please add at least one image" }).max(50, { error: "Please add a maximum of 50 images" })
})
export type MapEditingDataType = z.infer<typeof MapEditingData>
interface MapEditingErrors {
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

export interface MapEditingState extends FormState<[]> {
    mapId?: string,
    errors?: MapEditingErrors
}
export async function createMap(state: MapEditingState, submitted: MapEditingDataType): Promise<MapEditingState> {
    const { success, data, error } = z.safeParse(MapEditingData, submitted)

    const user = await getCurrentUser(true)

    if (!user) {
        redirect("/login?to=/map/new")
    }

    if (!success) {
        // @ts-expect-error foo
        const errs: MapEditingErrors = Object.entries(z.treeifyError(error).properties || {}).reduce((p, [k, v]) => ({ ...p, [k]: v[k == "images" ? "items" : "errors"] }), {})
        return {
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
        roundLimit: data.roundLimit,
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
export async function editMap(state: MapEditingState, submitted: MapEditingDataType): Promise<MapEditingState> {
    const { success, data, error } = z.safeParse(MapEditingData, submitted)

    const user = await getCurrentUser(true)

    if (!user) {
        redirect("/login?to=/map/new")
    }

    if (!success) {
        // @ts-expect-error foo
        const errs: MapEditingErrors = Object.entries(z.treeifyError(error).properties || {}).reduce((p, [k, v]) => ({ ...p, [k]: v[k == "images" ? "items" : "errors"] }), {})
        return {
            errors: {
                ...errs,
                server: [...(errs.server || []), ...(z.treeifyError(error).errors || []), ...(z.treeifyError(error).properties?.images?.errors || [])]
            }
        }
    }
    if (!data.id) return {
        errors: {
            server: ["Unable to find map"]
        }
    }
    const db = await createDB()
    const mapData = await db.query.map.findFirst({
        where: and(eq(map.id, data.id), eq(map.createdById, user.id)),
        with: {
            places: true
        }
    })
    console.log(mapData)
    if (!mapData) return {
        errors: {
            server: ["Unable to find map"]
        }
    }
    const { places } = mapData
    const newMapData = {
        id: mapData.id,
        name: data.name,
        createdById: user.id,
        roundLimit: data.roundLimit,
        imageGeojsonAvailable: data.geojson ? "true" : "false",
        imageLocationBlurred: data.blur ? "true" : "false",
        order: data.order,
        visibility: data.visibility,
        updateTime: Date.now() + (new Date().getTimezoneOffset() * 60_000)
    }
    await db.update(map).set(newMapData).where(eq(map.id, data.id))

    const newPlaces = data.images.map(img => ({
        imageId: img.image,
        index: img.index,
        mapId: mapData.id,
        time: img.time
    }))

    const batch: BatchItem<"sqlite">[] = []

    places.forEach(p => {
        if (newPlaces.some(place => objectMatch(p, place))) return 
        else if (newPlaces.some(place => place.imageId == p.imageId)) {
            batch.push(db.update(mapPlace).set(
                newPlaces.find(place => place.imageId == p.imageId)!
            ).where(
                and(
                    eq(mapPlace.imageId, p.imageId),
                    eq(mapPlace.mapId, mapData.id)
                )
            ))
        } else {
            batch.push(db.delete(mapPlace).where(
                and(
                    eq(mapPlace.imageId, p.imageId),
                    eq(mapPlace.mapId, mapData.id)
                )
            ))
        }
    })
    newPlaces.forEach(p => {
        if (places.some(place => place.imageId == p.imageId)) return 
        batch.push(db.insert(mapPlace).values(p))
    })
    
    if (batch.length > 0) await db.batch(batch as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]])

    if ((data.visibility == MapVisibility.FRIENDS || data.visibility == MapVisibility.PUBLIC) && mapData.visibility != MapVisibility.PUBLIC && mapData.visibility != MapVisibility.FRIENDS) {
        user.friends?.forEach(f => {
            const friend = f.user1id == user.id ? f.user2 : f.user1
            console.log(friend)
            if (friend) sendNotification({
                message: `
                <h1>User ${user.name} has just created a new msap called ${data.name}!</h1>
                <a href="/map/${data.id}"><button class="bg-green-600 cursor-pointer rounded shadow-xl/20 p-2">View</button></a>
                `,
                type: NotificationType.TEXT,
                recipient: friend.id,
                title: `${user.name?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} has created a new map!`
            })
        })
    }

    return {
        step: "success",
        mapId: data.id
    }
}