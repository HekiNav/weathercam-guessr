import { FormState } from "@/lib/definitions"
import { createDB } from "@/lib/db"
import * as GeoJSON from "geojson"
import { image } from "@/db/schema"
import { lt, ne, SQL } from "drizzle-orm"
let lastUpdateTime = Date.now()

const db = createDB()

export type ImageData = GeoJSON.FeatureCollection<GeoJSON.Point, ImageDataProperties>
export interface ImageDataProperties {
    id: string,
    name: string,
    collectionStatus: string,
    state: string | null,
    dataUpdatedTime: string,
    presets: {
        id: string,
        inCollection: boolean
    }[]
}

async function fetchImages() {
    lastUpdateTime = Date.now()
    return await (await fetch("https://tie.digitraffic.fi/api/weathercam/v1/stations")).json() as ImageData
}
async function getImages(condition: SQL, amount = 100) {
    if (Date.now() - lastUpdateTime > 3600_000) await parseImageData(await fetchImages()) // 1h "cache"
    return await (await db).select().from(image).where(condition).limit(amount)
}
async function parseImageData(data: ImageData,) {
    const items = data.features.flatMap(({ properties }) => properties.presets.map(preset => ({
        externalId: preset.id,
        available: `${preset.inCollection}`,
    })))
    const now = new Date()

    await Promise.all(
        items.map(async item =>
            await (await db)
                .insert(image)
                .values({
                    externalId: item.externalId,
                    id: crypto.randomUUID(),
                    available: item.available,
                    updateTime: now.toISOString(),
                })
                .onConflictDoUpdate({
                    target: image.externalId,
                    set: {
                        available: item.available,
                        updateTime: now.toISOString(),
                    },
                })
        )
    );

    // Mark items missing from external source as unavailable
    await (await db)
        .update(image)
        .set({
            available: "false",
        })
        .where(lt(image.updateTime, now.toISOString()));



}
export interface Image {
    id: string
    externalId: string
    source: string
    type: string
    difficulty: string
    updateTime: string,
    reviewState: string
    available: boolean
}
export interface ImageReviewFormState extends FormState<["difficulty", "blurRect", "type"]> {
    currentImage: Image | null
}
export interface ImageReviewData {
    type: "begin" | "submit"
}
export async function reviewImages(state: ImageReviewFormState, { type }: ImageReviewData): Promise<ImageReviewFormState> {
    switch (type) {
        case "submit":
        case "begin":
            const images = Array.from(await getImages(ne(image.reviewState, "COMPLETE"), 1))

            if (images && images[0]) return {
                step: "review",
                currentImage: { ...images[0], available: images[0].available == "true" } as Image
            }
            else return {
                step: "complete",
                currentImage: null
            }
    }

}
