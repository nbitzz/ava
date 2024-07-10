import { invalidate } from "$app/navigation";
import { deleteToken } from "$lib";
import configuration from "$lib/configuration.js";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies }) {
    let tok = cookies.get("token")
    if (!tok)
        return
    await deleteToken(tok)
    cookies.delete("token", { path: "/" })
    if (configuration.oauth2.endpoints.logout)
        throw redirect(302, configuration.oauth2.endpoints.logout)

    return { user: null }
}