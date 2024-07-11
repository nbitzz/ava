import {getRequestUser, launchLogin} from "$lib/oidc"
import configuration from "$lib/configuration.js";
import { fail } from "@sveltejs/kit";
import { avatarDirectory, renderSizes, setNewAvatar } from "$lib/avatars.js";
import { join } from "path";
export async function load({ request, parent, url }) {
    const { user } = await parent();
    if (!user)
        launchLogin(url.toString())

    return {
        url: url.toString(),
        allowedImageTypes: configuration.allowed_types,
        renderSizes
    }
}

export const actions = {
    set: async ({request, cookies}) => {
        let user = await getRequestUser(request, cookies);
        if (!user)
            return fail(401, {error: "unauthenticated"})

        let submission = await request.formData();
        let newAvatar = submission.get("newAvatar")
        if (newAvatar !== undefined && !(newAvatar instanceof File))
            return fail(400, {success: false, error: "incorrect entry type"})
        if (!configuration.allowed_types.includes(newAvatar.type))
            return fail(400, {success: false, error: `allowed types does not include ${newAvatar.type}`})

        let time = await setNewAvatar(user.sub, newAvatar)

        return {
            success: true,
            message: Object.entries(time)
                .map(([res, time]) => `${res}x${res} took ${time}ms to render`)
                .join("\n")
        }
    }
}