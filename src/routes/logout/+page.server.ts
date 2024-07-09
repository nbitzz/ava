import configuration from "$lib/configuration.js";
import { redirect } from "@sveltejs/kit";

export function load({}) {
    throw redirect(301, configuration.oauth2.endpoints.logout)
}