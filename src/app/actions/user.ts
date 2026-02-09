"use server"
import { friend, user } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { createDB } from "@/lib/db";
import { EmailSchema, FriendState, NotificationType, UsernameSchema } from "@/lib/definitions";
import { sendNotification } from "@/lib/notification";
import { getUser } from "@/lib/public";
import { and, eq, or } from "drizzle-orm";
import { cookies } from "next/headers";
import z from "zod";

export async function deleteUser() {
    const db = await createDB()

    const currentUser = await getCurrentUser()

    if (!currentUser) return {
        success: false,
        message: "Not logged in!"
    }


    await db.delete(user).where(eq(user.id, currentUser.id));
    (await cookies()).delete("session");

    return {
        success: true,
        message: "Deleted user"
    }

}

export async function changeUsername(newUsername: string) {
    const { success, error, data } = UsernameSchema.safeParse(newUsername)

    const db = await createDB()

    const currentUser = await getCurrentUser()

    if (!currentUser) return {
        success: false,
        message: "Not logged in!"
    }

    if (!success) return {
        success: false,
        message: z.treeifyError(error).errors.join(", ")
    }
    try {
        await db.update(user).set({ name: data }).where(eq(user.id, currentUser.id))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.cause.toString().includes("UNIQUE constraint failed: User.name")) return {
            success: false,
            message: "Username alrady in use"
        }
        else {
            return {
                success: false,
                message: "Server error"
            }
        }
    }

    return {
        success: true,
        message: "Changed username"
    }
}
export async function changeEmail(newEmail: string) {
    const { success, error, data } = EmailSchema.safeParse(newEmail)

    const db = await createDB()

    const currentUser = await getCurrentUser()

    if (!currentUser) return {
        success: false,
        message: "Not logged in!"
    }

    if (!success) return {
        success: false,
        message: z.treeifyError(error).errors.join(", ")
    }
    try {
        await db.update(user).set({ email: data }).where(eq(user.id, currentUser.id))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.cause.toString().includes("UNIQUE constraint failed: User.email")) return {
            success: false,
            message: "Email alrady in use"
        }
        else {
            return {
                success: false,
                message: "Server error"
            }
        }
    }
    (await cookies()).delete("session");
    return {
        success: true,
        message: "Succesfully changed email!"
    }
}
export async function sendFriendRequest(recipientId: string) {
    const db = await createDB()

    const recipient = await db.query.user.findFirst({ where: eq(user.id, recipientId) })

    if (!recipient) return {
        success: false,
        message: "Invalid user id"
    }

    const currentUser = await getCurrentUser(true)

    if (recipient.id == currentUser?.id) return {
        success: false,
        message: "Cannot send request to yourself"
    }

    if (!currentUser) return {
        success: false,
        message: "Not logged in!"
    }

    if (!currentUser.friends || currentUser.friends.find(f => f.user1id == recipientId || f.user2id == recipientId)) return {
        success: false,
        message: "Request already sent!"
    }

    await db.insert(friend).values({
        user1id: currentUser.id,
        user2id: recipientId
    })

    await sendNotification({
        message: `
        <h1>User ${currentUser.name} has sent you a friend request</h1>
        `,
        type: NotificationType.FRIEND_REQUEST,
        recipient: recipientId,
        email: `
        <h1>User ${currentUser.name} has sent you a friend request</h1>
        <p>Accept or reject it in</p>
        <h2><a href="https://guessr.hekinav.dev/user/me" style="color:#16a34a; margin-bottom: 100px;">Weathercam-guessr</a></h2>
        <small>This is an automated message from Weathercam-guessr. If you wish to not receive emails from friend request, please delete your account</small>
        `,
        title: `${currentUser.name} has sent you a friend request in Weathercam-guessr`,
        recipientEmail: recipient.email,
        sender: currentUser.id
    })

    return {
        success: true,
        message: "Succesfully sent request!"
    }
}
export async function respondToFriendRequest(friendId: string, state: FriendState) {
    const db = await createDB()

    const currentUser = await getCurrentUser(true)

    if (friendId == currentUser?.id) return {
        success: false,
        message: "Cannot accept request from yourself"
    }

    if (!currentUser) return {
        success: false,
        message: "Not logged in!"
    }

    if (!currentUser.friends || !currentUser.friends.find(f => f.user1id == friendId || f.user2id == friendId)) return {
        success: false,
        message: "No request sent to user, or user does not exist"
    }

    await db.update(friend).set({state}).where(or(
        and(eq(friend.user1id, currentUser.id),eq(friend.user2id, friendId)),
        and(eq(friend.user2id, currentUser.id),eq(friend.user1id, friendId))
    ))

    if (state != FriendState.PENDING) await sendNotification({
        message: `
        <p>${currentUser.name} has ${state == FriendState.ACCEPTED ? "accepted" : "rejected"} your friend request</p>
        `,
        type: NotificationType.TEXT,
        recipient: friendId,
        title: `${currentUser.name} has ${state == FriendState.ACCEPTED ? "accepted" : "rejected"} your friend request`,
        sender: currentUser.id
    })

    return {
        success: true,
        message: "Succesfully sent request!"
    }
}
