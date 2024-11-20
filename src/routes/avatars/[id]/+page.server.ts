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
export async function load({ request, parent, url, params: { id } }) {
    const { user } = await parent()
    if (!user) return launchLogin(url.toString())

    return {
        url: url.toString(),
        avatar: await prisma.avatar.findUnique({ where: { id } }),
    }
}

export const actions = {
    default: async ({ request, cookies, params: { id } }) => {
        let user = await getRequestUser(request, cookies)
        if (!user) return fail(401, { error: "unauthenticated" })

        let { altText, source } = Object.fromEntries(
            (await request.formData()).entries()
        )

        await prisma.avatar.update({
            where: {
                id,
            },
            data: {
                altText: altText instanceof File ? undefined : altText,
                source: source instanceof File ? undefined : source,
            },
        })

        return redirect(302, "/set")
    },
}
