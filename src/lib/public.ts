// public data functions for users

export async function getUser(identifier: string) {
    return prisma?.user.findFirst({where: {OR: [{id: identifier}, {name: identifier}]}, select: {id: true, name: true, createdAt: true, admin: true}})
}