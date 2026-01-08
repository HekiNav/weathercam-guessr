import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from "@/db/schema"

export interface Env {
  weathercam_guessr_prod: D1Database;
}

export async function createDB() {
  const { env } = await getCloudflareContext({ async: true })
  return drizzle((env as Env).weathercam_guessr_prod, { schema })
} 