import { getRequestUser, launchLogin } from "$lib/oidc"
import configuration from "$lib/configuration.js"
import { error, fail, redirect } from "@sveltejs/kit"
import {
    avatarDirectory,
    createNewAvatar,
    deleteAvatar,
    getMetadataForUserId,
} from "$lib/avatars.js"
import { join } from "path"
import { prisma } from "$lib/clientsingleton"
export async function load({ request, parent, url, params: { id } }) {
    const { user } = await parent()
    if (!user) return launchLogin(url.toString())

    let avatar = await prisma.avatar.findUnique({
        where: { id, userId: user.sub },
    })

    if (!avatar)
        throw error(404, "Avatar is not owned by you or does not exist")

    return {
        url: url.toString(),
        avatar,
    }
}

export const actions = {
    default: async ({ request, cookies, params: { id } }) => {
        let user = await getRequestUser(request, cookies)
        if (!user) return fail(401, { error: "unauthenticated" })

        if (
            !(await prisma.avatar.findUnique({
                where: { id, userId: user.sub },
            }))
        )
            return fail(404, {
                error: "Avatar is not owned by you or does not exist",
            })

        let { action, altText, source } = Object.fromEntries(
            (await request.formData()).entries()
        )

        if (action == "Save") {
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
        } else if (action == "Delete") {
            await deleteAvatar(id)
            return redirect(302, "/set")
        }
    },
}