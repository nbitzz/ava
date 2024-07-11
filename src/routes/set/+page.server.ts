import {launchLogin} from "$lib/oidc"
import configuration from "$lib/configuration.js";
export async function load({ request, parent }) {
    const { user } = await parent();
    if (!user)
        launchLogin(request)

    return {
        url: request.url,
        allowedImageTypes: configuration.allowed_types
    }
}