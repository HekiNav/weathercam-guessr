// @ts-expect-error `.open-next/worker.ts` is generated at build time
import { default as handler } from "../.open-next/worker.js";

import { and, eq, lt, notExists, or, sql } from "drizzle-orm";

import * as schema from "@/db/schema.js";
import { drizzle } from "drizzle-orm/d1";
import { image } from "@/db/schema.js";

export interface Env {
	weathercam_guessr_prod: D1Database;
}

export default {
	fetch: handler.fetch,

	/**
	 * Scheduled Handler
	 *
	 * Can be tested with:
	 * - `wrangler dev --test-scheduled`
	 * - `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"`
	 * @param event
	 */
	async scheduled(controller, env) {
		const db = drizzle((env as Env).weathercam_guessr_prod, { schema })
		switch (controller.cron) {
			case "0 0 * * *":

				const dailyImage = await db.query.image.findFirst({
					columns: {
						id: true
					},
					where: and(
						or(eq(schema.image.type, "ROAD"), eq(schema.image.type, "SCENERY")),
						eq(schema.image.available, "true"),
						eq(schema.image.reviewState, "COMPLETE"),
						notExists(
							db
								.select()
								.from(schema.mapPlace)
								.innerJoin(schema.map, eq(schema.map.id, schema.mapPlace.mapId))
								.where(
									and(
										eq(schema.mapPlace.imageId, schema.image.id),
										eq(schema.map.type, "DAILY_CHALLENGE")
									)
								)
						)
					),
					orderBy: sql`RANDOM()`
				})
				if (!dailyImage?.id) throw new Error("No image found" + JSON.stringify(dailyImage || {}))
				const mapId = crypto.randomUUID()
				await db.insert(schema.map).values({
					type: "DAILY_CHALLENGE",
					id: mapId,
				})
				await db.insert(schema.mapPlace).values({
					imageId: dailyImage?.id,
					mapId: mapId
				})
				break;
			case "22 * * * *":

				const data = await fetchImages()

				const items = data.features.flatMap(({ properties, geometry }) => properties.presets.map(preset => ({
					externalId: preset.id,
					available: `${preset.inCollection}`,
					lat: geometry.coordinates[0],
					lon: geometry.coordinates[1]
				})))
				const now = Date.now()

				await Promise.all(
					items.map(async item =>
						await db
							.insert(image)
							.values({
								externalId: item.externalId,
								id: crypto.randomUUID(),
								available: item.available,
								updateTime: now,
								lat: item.lat,
								lon: item.lon
							})
							.onConflictDoUpdate({
								target: image.externalId,
								set: {
									available: item.available,
									updateTime: now,
									lat: item.lat,
									lon: item.lon
								},
							})
					)
				);

				// Mark items missing from external source as unavailable
				await db
					.update(image)
					.set({
						available: "false",
					})
					.where(lt(image.updateTime, now));



				break
		}
	},
} satisfies ExportedHandler<CloudflareEnv>;
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
	return await (await fetch("https://tie.digitraffic.fi/api/weathercam/v1/stations")).json() as ImageData
}
// @ts-expect-error `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "../.open-next/worker.js";