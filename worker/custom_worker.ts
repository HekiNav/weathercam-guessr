// @ts-expect-error `.open-next/worker.ts` is generated at build time
import { default as handler } from "../.open-next/worker.js";

import { and, eq, notExists, or, sql } from "drizzle-orm";

import * as schema from "@/db/schema.js";
import { drizzle } from "drizzle-orm/d1";

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
	async scheduled(event, env) {
		console.log("Scheduled event", event);
		const db = drizzle((env as Env).weathercam_guessr_prod, { schema })
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
		db.transaction(async (tx) => {
			const mapId = crypto.randomUUID()
			await tx.insert(schema.map).values({
				type: "DAILY_CHALLENGE",
				id: mapId,
			})
			await tx.insert(schema.mapPlace).values({
				imageId: dailyImage?.id,
				mapId: mapId
			})
		})
	},
} satisfies ExportedHandler<CloudflareEnv>;

// @ts-expect-error `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "../.open-next/worker.js";