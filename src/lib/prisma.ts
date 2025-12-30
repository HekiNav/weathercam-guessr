import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL
})

export const prisma =
  globalThis.prisma ?? new PrismaClient({
    adapter: adapter
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}
