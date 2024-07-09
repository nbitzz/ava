import { redirect } from "@sveltejs/kit"
import configuration from "./configuration"

const states = new Map<string, ReturnType<typeof setTimeout>>()

export function launchLogin(req: Request) {
    // Create a state to be used in the OAuth2 authorization request
    const state = crypto.randomUUID()

    // Generate the query string and construct a URL using it
    const searchParams = new URLSearchParams({
        response_type: "code",
        client_id: configuration.oauth2.client.id,
        redirect_uri: new URL(`/set`, req.url).toString(),
        scope: "openid profile email",
        state
    })
    // Did not think this would work lmao
    const target = new URL(
        `?${searchParams.toString()}`,
        configuration.oauth2.endpoints.authenticate
    )

    states
        .set(state, setTimeout(() => states.delete(state), 60000))
    
    return redirect(302, target.toString())
}