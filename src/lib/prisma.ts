import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function createPrismaClient() {
  const { env } = await getCloudflareContext({async: true})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaD1((env as any).weathercam_guessr_prod)
  return new PrismaClient({ adapter })
}
