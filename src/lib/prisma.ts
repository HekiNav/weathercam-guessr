import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export function createPrismaClient() {
  const { env } = getCloudflareContext()
  const adapter = new PrismaD1((env as any).weathercam_guessr_prod)
  return new PrismaClient({ adapter })
}
