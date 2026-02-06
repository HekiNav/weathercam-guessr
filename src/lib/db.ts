import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from "@/db/schema"

export interface Env {
  weathercam_guessr_prod: D1Database;
  foobucket: R2Bucket
}

let db: DrizzleD1Database<typeof schema> | null = null

export async function createDB() {
  if (!db) {
    const { env } = await getCloudflareContext({ async: true })
    db = drizzle((env as Env).weathercam_guessr_prod, { schema })
  }
  return db
}

export async function getBucket() {
  const { env } = await getCloudflareContext({ async: true })
  return (env as Env).foobucket
}