import { default as handler } from "../.open-next/worker.js";

import { and, eq, notExists, or, sql } from "drizzle-orm";

import { createDB } from "@/lib/db.js";
import { image, map, mapPlace } from "@/db/schema.js";

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
	async scheduled(event) {
		console.log("Scheduled event", event);
		const db = await createDB()
		const dailyImage = await db.query.image.findFirst({
			columns: {
				id: true
			},
			where: and(
				or(eq(image.type, "ROAD"), eq(image.type, "SCENERY")),
				eq(image.available, "TRUE"),
				eq(image.reviewState, "COMPLETE"),
				notExists(
					db
						.select({ one: sql`1` })
						.from(mapPlace)
						.innerJoin(map, eq(map.id, mapPlace.mapId))
						.where(
							and(
								eq(mapPlace.imageId, image.id),
								eq(map.type, "DAILY_CHALLENGE")
							)
						)
				)
			),
			orderBy: sql`RANDOM()`
		})
		if (!dailyImage?.id) return
		db.transaction(async (tx) => {
			const mapId = crypto.randomUUID()
			await tx.insert(map).values({
				type: "DAILY_CHALLENGE",
				id: mapId,
			})
			await tx.insert(mapPlace).values({
				imageId: dailyImage?.id,
				mapId: mapId
			})
		})
	},
} satisfies ExportedHandler<CloudflareEnv>;

export { DOQueueHandler, DOShardedTagCache } from "../.open-next/worker.js";