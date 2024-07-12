import {getRequestUser, launchLogin} from "$lib/oidc"
import configuration from "$lib/configuration.js";
import { fail } from "@sveltejs/kit";
import { avatarDirectory, setNewAvatar } from "$lib/avatars.js";
import { join } from "path";
export async function load({ request, parent, url }) {
    const { user } = await parent();
    if (!user)
        launchLogin(url.toString())

    return {
        url: url.toString(),
        allowedImageTypes: configuration.images.permitted_input,
        renderSizes: configuration.images.output_resolutions
    }
}

export const actions = {
    default: async ({request, cookies}) => {
        let user = await getRequestUser(request, cookies);
        if (!user)
            return fail(401, {error: "unauthenticated"})

        let submission = await request.formData();
        let newAvatar = undefined
        if (submission.get("action") != "Clear") {
            newAvatar = submission.get("newAvatar")
            if (newAvatar !== undefined && !(newAvatar instanceof File))
                return fail(400, {success: false, error: "incorrect entry type"})
            if (!configuration.images.permitted_input.includes(newAvatar.type))
                return fail(400, {success: false, error: `allowed types does not include ${newAvatar.type}`})
        }
        let timing = await setNewAvatar(user.sub, newAvatar)

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