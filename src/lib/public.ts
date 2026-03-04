"use server"
import { map, session, user } from "@/db/schema"
import { createDB, getBucket } from "./db"
import { desc, eq, or } from "drizzle-orm"
import { Friend, ImageOrder, Map, MapType, MapVisibility, User } from "./definitions"
import MiniSearch from "minisearch"
import { FeatureCollection, Point } from "geojson"
import { Image } from "@/app/actions/image"
import { getCurrentUser } from "./auth"

// public data functions for users
export async function getUser(identifier: string) {
    const db = await createDB()
    const data = await db.query.user.findFirst({
        where: or(eq(user.id, identifier), eq(user.name, identifier)),
        with: { maps: true, sessions: { limit: 1, orderBy: desc(session.expiresAt) }, friends1: { with: { user1: true, user2: true } }, friends2: { with: { user1: true, user2: true } } }
    })
    if (!data) return null
    // redact email, also booleans are stored as strings in the db
    return {
        ...data, email: "N/A", admin: data.admin == "true", lastSeen: data.sessions[0].expiresAt, friends: [...data.friends1,
        ...data.friends2.map(f => ({ ...f, user1: { ...f.user1, admin: f.user1.admin == "true" }, user2: { ...f.user2, admin: f.user2.admin == "true" } }))] as Friend[]
    }
}
let users: User[] | null = null
const minisearch = new MiniSearch({
    fields: ["name", "id"],
    storeFields: ["name", "id", "admin", "email", "friends", "createdAt"],
})
export async function searchUser(query: string): Promise<User[]> {
    const db = await createDB()
    if (!users || !users.length) {
        users = (await db.query.user.findMany({ with: { friends1: true, friends2: true } })).map(f => ({ ...f, admin: f.admin == "true", email: "N/A", friends: [...f.friends1, ...f.friends2] as Friend[] }))
        await minisearch.addAllAsync(users)
    }
    return minisearch.search(query, {
        fuzzy: 0.6,
    }) as never
}
export async function getImages() {
    const bucket = await getBucket()
    const response = await bucket.get("weathercam-guessr-images.geojson")
    return await response?.json() as FeatureCollection<Point, Image> | null
}
export async function getMap(mapId: string): Promise<Map | null> {
    const db = await createDB()
    const user = await getCurrentUser(true)
    const data = await db.query.map.findFirst({
        where: eq(map.id, mapId),
        with: { places: { with: { image: { with: { rect: true } } } }, createdBy: { columns: { name: true, id: true } } }
    })
    const mapData = data ? {
        ...data, createdBy: data?.createdBy as User,
        order: data.order as ImageOrder,
        imageGeojsonAvailable: data.imageGeojsonAvailable == "true",
        imageLocationBlurred: data.imageLocationBlurred == "true",
        creationTime: data?.creationTime || 0, updateTime: data?.updateTime || 0, type: data?.type as MapType, visibility: data?.visibility as MapVisibility, places: data?.places.map(p => ({
            ...p,
            image: { ...p.image, available: p.image.available == "true" }
        }))
    } : null
    if (mapData?.visibility == MapVisibility.PRIVATE && user?.id != mapData.createdById) return null
    if (mapData?.visibility == MapVisibility.FRIENDS && user?.id != mapData.createdById && !user?.friends?.some(f=> f.user1id == mapData.createdById || f.user2id == mapData.createdById)) return null
    return mapData

}