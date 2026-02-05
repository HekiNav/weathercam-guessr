import { drizzle } from "drizzle-orm/d1";
import { Env } from "./custom_worker";
import * as schema from "@/db/schema"
import { and, eq } from "drizzle-orm";
import { FeatureCollection } from "geojson";

export async function generateGeoJson(env: Env) {
    const db = drizzle((env as Env).weathercam_guessr_prod, { schema })
    const bucket = env.foobucket
    const images = await db.query.image.findMany({
        where: and(
            eq(schema.image.available, "true"),
            eq(schema.image.reviewState, "COMPLETE")
        ),
        with: {
            rect: true
        }
    })
    const geojson: FeatureCollection = {
        type: "FeatureCollection",
        features: images.map(img => {
            const { lat, lon, ...properties } = img
            return {
                type: "Feature",
                properties: properties,
                geometry: {
                    type: "Point",
                    coordinates: [lon, lat]
                }
            }
        })
    }
    bucket.put("weathercam-guessr-images.geojson", JSON.stringify(geojson))
}