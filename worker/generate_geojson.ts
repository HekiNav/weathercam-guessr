import { drizzle } from "drizzle-orm/d1";
import { Env } from "./custom_worker";
import * as schema from "@/db/schema"
import { eq } from "drizzle-orm";
import { FeatureCollection } from "geojson";

export async function generateGeoJson(env: Env) {
    const db = drizzle((env as Env).weathercam_guessr_prod, { schema })
    const bucket = env.foobucket
    const images = await db.query.image.findMany({
        where: eq(schema.image.available, "true"),
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
    bucket.put("weathercam-guessr-images", JSON.stringify(geojson))
}