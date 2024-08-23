import {getRequestUser, launchLogin} from "$lib/oidc"
import configuration from "$lib/configuration.js";
import { fail } from "@sveltejs/kit";
import { avatarDirectory, getMetadataForUserId, setNewAvatar } from "$lib/avatars.js";
import { join } from "path";
import { prisma } from "$lib/clientsingleton";
export async function load({ request, parent, url }) {
    const { user } = await parent();
    if (!user)
        return launchLogin(url.toString())

    return {
        url: url.toString(),
        avatar: await getMetadataForUserId(user.sub),
        allowedImageTypes: configuration.images.permitted_input,
        renderSizes: configuration.images.output_resolutions
    }
}

export const actions = {
    default: async ({request, cookies}) => {
        let user = await getRequestUser(request, cookies);
        if (!user)
            return fail(401, {error: "unauthenticated"})

        let submission = Object.fromEntries((await request.formData()).entries());
        let newAvatar = submission.newAvatar
        let timing: Awaited<ReturnType<typeof setNewAvatar>> = {}
        let isUploadingNewFile = submission.action == "Clear"

        if (
            !isUploadingNewFile // if action isn't already clear
            && newAvatar !== undefined // and avatar is defined
            && (newAvatar instanceof File && newAvatar.size > 0)
        ) {
            if (!configuration.images.permitted_input.includes(newAvatar.type))
                return fail(400, {success: false, error: `allowed types does not include ${newAvatar.type}`})
            isUploadingNewFile = true
        }
        
        if (isUploadingNewFile)
            timing = await setNewAvatar(user.sub, newAvatar as File|null || undefined)
        if (await prisma.avatar.findFirst({ where: { userId: user.sub } }))
            await prisma.avatar.update({
                where: {
                    userId: user.sub
                },
                data: {
                    altText: typeof submission.altText == "string" ? submission.altText : null,
                    source: typeof submission.source == "string" ? submission.source : null,
                }
            })

        return {
            success: true,
            message: Object.entries(timing)
                .map(([res, time]) => `render ${res}x${res}: ${
                    Object.entries(time).map(([type, t]) => `${type}: ${t}ms`).join(", ")
                }`)
                .join("\n")
                || "No timing information available"
        }
    }
}