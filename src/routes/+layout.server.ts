import { getRequestUser } from '$lib/oidc';

export async function load({request, cookies}) {
    return {
        user: await getRequestUser(request, cookies)
    }
}