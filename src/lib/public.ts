import { createPrismaClient } from "./prisma"

// public data functions for users
const prisma = createPrismaClient()
export async function getUser(identifier: string) {
    return (await prisma)?.user.findFirst({where: {OR: [{id: identifier}, {name: identifier}]}, select: {id: true, name: true, createdAt: true, admin: true}})
}