import {launchLogin} from "$lib"
export async function load({ request, parent }) {
    const { user } = await parent();
    if (!user)
        launchLogin(request)
    
    return {
        url: request.url
    }
}