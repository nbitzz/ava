import { getRequestUser, launchLogin } from "$lib/oidc"
import configuration from "$lib/configuration.js"
import { fail } from "@sveltejs/kit"
import {
    avatarDirectory,
    executeHooksForUser,
    getMetadataForUserId,
    sanitizeAvatar,
} from "$lib/avatars.js"
import { join } from "path"
import { prisma } from "$lib/clientsingleton"
export async function load({ request, parent, url }) {
    const { user } = await parent()
    if (!user) return launchLogin(url.toString())

    return {
        url: url.toString(),
        avatars: (
            await prisma.avatar.findMany({
                where: { userId: user.sub },
                include: { usedBy: true },
            })
        )
            .reverse()
            .map(e => ({ ...e, inUse: Boolean(e.usedBy) })),
    }
}

export const actions = {
    default: async ({ request, cookies }) => {
        let user = await getRequestUser(request, cookies)
        if (!user) return fail(401, { error: "unauthenticated" })

        let submission = Object.fromEntries(
            (await request.formData()).entries()
        )

        if (typeof submission.action != "string")
            return fail(400, { error: "bad action" })

        if (submission.action == "Clear") {
            await prisma.user.update({
                where: {
                    userId: user.sub,
                },
                data: {
                    currentAvatarId: null,
                },
            })

            executeHooksForUser(user.sub, sanitizeAvatar(null))

            return {
                success: true,
                message: "Avatar cleared successfully",
            }
        } else if (submission.action.startsWith("Set:")) {
            let avatarId = submission.action.match(/Set\:(.*)/)![1]

            // make sure the avatar exists and is owned by the user
            let avatar = await prisma.avatar.findUnique({
                where: {
                    id: avatarId,
                    userId: user.sub,
                },
            })

            if (!avatar)
                return fail(400, {
                    error: "This avatar does not exist or you do not own it",
                })

            await prisma.user.update({
                where: {
                    userId: user.sub,
                },
                data: {
                    currentAvatarId: avatar.id,
                },
            })

            executeHooksForUser(user.sub, sanitizeAvatar(avatar))

            return {
                success: true,
                message: "New avatar set",
            }
        }
    },
}
