import { getRequestUser, launchLogin } from "$lib/oidc"
import configuration from "$lib/configuration.js"
import { fail, redirect } from "@sveltejs/kit"
import {
    avatarDirectory,
    createNewAvatar,
    getMetadataForUserId,
} from "$lib/avatars.js"
import { join } from "path"
import { prisma } from "$lib/clientsingleton"
import { URL_REGEX } from "$lib/common.js"
export async function load({ request, parent, url }) {
    const { user } = await parent()
    if (!user) return launchLogin(url.toString())

    return {
        url: url.toString(),
        webhooks: await prisma.webhook.findMany({
            where: { userId: user.sub },
        }),
    }
}

export const actions = {
    create: async ({ request, cookies }) => {
        let user = await getRequestUser(request, cookies)
        if (!user) return fail(401, { error: "unauthenticated" })

        let { url } = Object.fromEntries((await request.formData()).entries())

        if (!url || url instanceof File)
            return fail(400, { error: "no url supplied" })

        try {
            new URL(url)
        } catch {
            return fail(400, { error: "bad url" })
        }

        url = new URL(url).toString()

        if (
            await prisma.webhook.findFirst({
                where: {
                    userId: user.sub,
                    url,
                },
            })
        )
            return fail(409, { error: "Webhook already exists" })

        await prisma.webhook.create({
            data: {
                url,
                userId: user.sub,
            },
        })

        return {
            success: true,
            message: "New webhook created",
        }
    },
    manage: async ({ request, cookies }) => {
        let user = await getRequestUser(request, cookies)
        if (!user) return fail(401, { error: "unauthenticated" })

        let { action, toggle, url } = Object.fromEntries(
            (await request.formData()).entries()
        )

        if (!url || url instanceof File)
            return fail(400, { error: "no url supplied" })

        let whk = await prisma.webhook.findUnique({
            where: {
                url_userId: {
                    url,
                    userId: user.sub,
                },
            },
        })

        if (!whk) return fail(404, { error: "webhook doesn't exist" })

        if (action == "Delete") {
            await prisma.webhook.delete({
                where: {
                    url_userId: {
                        url,
                        userId: user.sub,
                    },
                },
            })

            return {
                success: true,
                message: "Webhook deleted",
            }
        } else if (toggle) {
            await prisma.webhook.update({
                where: {
                    url_userId: {
                        url,
                        userId: user.sub,
                    },
                },
                data: {
                    enabled: !whk.enabled,
                },
            })

            return {
                success: true,
                message: "Webhook updated",
            }
        }
    },
}
