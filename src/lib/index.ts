import { error, redirect, type Cookies } from "@sveltejs/kit"
import configuration from "./configuration"

// Map of OAuth2 states
const states = new Map<string, { redirect_uri: string, timeout: ReturnType<typeof setTimeout> }>()

/**
 * @description Launch an OAuth2 login request for this request.
 * @param req Request to launch the login for; required to obtain the Host header.
 */
export function launchLogin(req: Request) {
    // Create a state to be used in the OAuth2 authorization request
    const state = crypto.randomUUID()

    // Generate the query string and construct a URL using it
    const searchParams = new URLSearchParams({
        response_type: "code",
        client_id: configuration.oauth2.client.id,
        redirect_uri: req.url,
        scope: "openid profile email",
        state
    })
    // Did not think this would work lmao
    const target = new URL(
        `?${searchParams.toString()}`,
        configuration.oauth2.endpoints.authenticate
    )
    
    // cache state
    // NO IDEA IF THIS WORKS IN SERVERLESS LOL
    // not like this is going to be running serverless anyway
    states
        .set(
            state,
            {
                timeout: setTimeout(
                    () => states.delete(state),
                    2*60*1000
                ),
                redirect_uri: req.url
            }
        )
    
    throw redirect(302, target.toString())
}

/**
 * @description Request a token from the OAuth server
 * @param params 
 * @returns Access token, its time-to-expiration, and refresh token if applicable
 */
export async function retrieveToken(
    params: 
        {grant_type: "authorization_code", redirect_uri: string, code: string}
        | {grant_type: "refresh_token", refresh_token: string}
) {
        // Generate a query string for the request
        const searchParams = new URLSearchParams({
            ...params,
            client_id: configuration.oauth2.client.id,
            client_secret: configuration.oauth2.client.secret
        })
        const url = new URL(
            `?${searchParams.toString()}`,
            configuration.oauth2.endpoints.token
        )

        let res = await fetch(url)
        if (!res.ok)
            throw error(401, "Couldn't retrieve token for user")
        else
            return (await res.json()) as { access_token: string, expires_in: number, refresh_token?: string }
}

export async function getRequestUser(request: Request, cookies: Cookies) {
    const params = new URLSearchParams(request.url.split("?").slice(1).join("?"))
    let token = cookies.get("token")
    if (!token && params.has("code") && params.has("state")) {
        if (!states.has(params.get("state")!))
            throw error(401, "bad state")

        token = params.get("code")!
        cookies.set("token", token, { path: "/" })
    }
}