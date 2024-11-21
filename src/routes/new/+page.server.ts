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
export async function load({ request, parent, url }) {
    const { user } = await parent()
    if (!user) return launchLogin(url.toString())

    return {
        url: url.toString(),
        allowedImageTypes: configuration.images.permitted_input,
        renderSizes: configuration.images.output_resolutions,
    }
}

export const actions = {
    default: async ({ request, cookies }) => {
        let user = await getRequestUser(request, cookies)
        if (!user) return fail(401, { error: "unauthenticated" })

        let { newAvatar, altText, source } = Object.fromEntries(
            (await request.formData()).entries()
        )

        if (
            newAvatar === undefined ||
            !(newAvatar instanceof File) ||
            newAvatar.size == 0
        )
            return fail(400, { error: "no file was attached" })

        if (!configuration.images.permitted_input.includes(newAvatar.type))
            return fail(400, {
                success: false,
                error: `allowed types does not include ${newAvatar.type}`,
            })

        let timing = await createNewAvatar(user.sub, newAvatar, {
            altText: altText instanceof File ? undefined : altText,
            source: source instanceof File ? undefined : source,
        })

        return redirect(302, "/set")
    },
}
