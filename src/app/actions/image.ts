import { Image, Prisma } from "@prisma/client"
import * as GeoJSON from "geojson"
let lastUpdateTime = Date.now()

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
async function getImages(where?: Prisma.ImageWhereInput) {
    if (Date.now() - lastUpdateTime > 3600_000) return await parseImageData(await fetchImages()) // 5s "cache"
    return prisma?.image.findMany({ where: where })
}
async function parseImageData(data: ImageData,) {
    const items = data.features.flatMap(({ properties }) => properties.presets.map(preset => ({
        externalId: preset.id,
        available: preset.inCollection,
    })))
    const now = new Date()
    console.log("aaa")

    await prisma?.$transaction(async tx => {
        // Upsert all items from external source
        await Promise.all(
            items.map(item =>
                tx.image.upsert({
                    where: { externalId: item.externalId },
                    update: {
                        available: item.available,
                        updateTime: now,
                    },
                    create: {
                        externalId: item.externalId,
                        available: item.available,
                        updateTime: now,
                    },
                })
            )
        )

        // Mark items missing from digitraffic as unavailable
        await tx.image.updateMany({
            where: {
                updateTime: { lt: now },
            },
            data: {
                available: false,
            },
        })
    })



}

export async function getReviewableImages() {
    const images = await getImages({reviewState: {not: "COMPLETE"}})
    return images
}
