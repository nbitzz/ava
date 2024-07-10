import { getRequestUser } from '$lib';

export async function load({request, cookies}) {
    return {
        user: await getRequestUser(request, cookies)
    }
}