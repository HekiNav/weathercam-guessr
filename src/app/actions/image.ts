"use server"
import { FormState } from "@/lib/definitions"
import { createDB } from "@/lib/db"
import * as GeoJSON from "geojson"
import * as schema from "@/db/schema"
import { eq, ne, SQL } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { image, rect } from "@/db/schema"
import { BlurRect, ImageDifficulty, ImageType, UnclassifiedEnum } from "@/lib/definitions"
import z from "zod"


async function getImages(condition: SQL, amount = 100, db: DrizzleD1Database<typeof schema>) {
    // TODO: migrate this to a Cron trigger (done)
    return await db.query.image.findMany({
        with: { rect: true },
        where: condition,
        limit: amount
    })
}

export interface Image {
    id: string
    externalId: string
    source: string
    type: string
    difficulty: string
    updateTime: number,
    reviewState: string
    available: boolean,
    rect: BlurRect,
    lat: number,
    lon: number
}
export interface ImageReviewFormState extends FormState<["difficulty", "blurRect", "type"]> {
    currentImage: Image | null
    errors?: {
        imageDifficulty?: string[]
        imageType?: string[]
        blurRect?: string[]
    }
}
export interface ImageReviewData {
    type: "begin" | "submit",
    imageDifficulty?: ImageDifficulty | UnclassifiedEnum,
    imageType?: ImageType | UnclassifiedEnum,
    blurRect?: BlurRect | null
}
export async function reviewImages(state: ImageReviewFormState, actionData: ImageReviewData): Promise<ImageReviewFormState> {
    const db = await createDB()
    const { type } = actionData
    switch (type) {
        case "submit":
            const schema = z.object({
                imageDifficulty: z.enum(["MEDIUM", "HARD", "EASY"], { error: "Invalid image difficulty" }),
                imageType: z.enum(["ROAD_SURFACE", "SCENERY", "ROAD", "BROKEN"], { error: "Invalid image type" }),
                blurRect: z.object({
                    x: z.int().min(0).max(100),
                    y: z.int().min(0).max(100),
                    width: z.int().min(0).max(100),
                    height: z.int().min(0).max(100)
                }, { error: "Blur rect is null" })
            })
            const { success, error, data } = schema.safeParse(actionData as ImageReviewData)
            if (!success || error) {
                return {
                    currentImage: state.currentImage,
                    errors: Object.entries(z.treeifyError(error).properties || {}).reduce((p, [k, v]) => ({ ...p, [k]: v.errors }), {} as typeof state.errors),
                    step: state.step
                }
            } else if (data && state.currentImage) {
                await db.insert(rect).values({ id: state.currentImage.id, ...data.blurRect }).onConflictDoUpdate({
                    target: rect.id,
                    set: { ...data.blurRect }
                })
                await db.update(image).set({ reviewState: "COMPLETE", difficulty: data.imageDifficulty, type: data.imageType, updateTime: Date.now() }).where(eq(image.id, state.currentImage.id))
            }
        case "begin":
            const images = Array.from(await getImages(ne(image.reviewState, "COMPLETE"), 1, db))


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
