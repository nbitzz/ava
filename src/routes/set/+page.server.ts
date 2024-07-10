import {launchLogin} from "$lib"
export async function load({ request, parent }) {
    //const { user } = await parent();
    let user = null
    if (!user)
        launchLogin(request)
}