import { error, redirect, type Cookies } from "@sveltejs/kit"
import configuration from "./configuration"
import type { User } from "./types"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Map of OAuth2 states
const states = new Map<string, { redirect_uri: string, timeout: ReturnType<typeof setTimeout> }>()
// Cache of userinfo
const userInfoCache = new Map<string, User>()

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
        scope: "openid profile",
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
export async function getNewToken(
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

        // send request to retrieve tokens
        let res = await fetch(configuration.oauth2.endpoints.token, {
            method: "POST",
            body: searchParams // this standard sucks, actually 
        })
        if (res.ok)
            return (await res.json()) as { access_token: string, expires_in: number, refresh_token?: string }
}

export function fetchUserInfo(token: string) {
    // try fetching new userinfo
    return fetch(configuration.userinfo.route, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
}

export async function getUserInfo(id: string) {
    // fetch token information
    const tokenInfo = await prisma.token.findUnique({
        where: { id }
    })
    if (!tokenInfo) return

    // check for cached userinfo
    if (userInfoCache.has(tokenInfo.owner))
        return userInfoCache.get(tokenInfo.owner)

    let userInfoRequest = await fetchUserInfo(tokenInfo.token)
    if (!userInfoRequest.ok) {
        // assume that token has expired.
        // try fetching a new one

        if (!tokenInfo.refreshToken) return // no refresh token. back out
        let token = await getNewToken({
            grant_type: "refresh_token",
            refresh_token: tokenInfo.refreshToken
        })

        if (!token) return // refresh failed. back out
        prisma.token.update({
            where: { id },
            data: {
                token: token.access_token,
                refreshToken: token.refresh_token
            }
        })

        userInfoRequest = await fetchUserInfo(token.access_token)
        if (!userInfoRequest.ok) return // Give up
    }

    const userInfo = await userInfoRequest.json()
    
    // cache userinfo
    userInfoCache.set(tokenInfo.owner, userInfo)
    setTimeout(() => userInfoCache.delete(tokenInfo.owner), 60*60*1000)

    return userInfo as User
}

export function deleteToken(id: string) {
    prisma.token.delete({
        where: {id}
    })
}

export async function getRequestUser(request: Request, cookies: Cookies) {
    const params = new URLSearchParams(request.url.split("?").slice(1).join("?"))
    let token = cookies.get("token")
    // log user in
    if (!token && params.has("code") && params.has("state")) {
        // check if state is real
        if (!states.has(params.get("state")!))
            throw error(401, "bad state")

        // get state
        let state = states.get(params.get("state")!)!
        states.delete(params.get("state")!)
        clearTimeout(state.timeout)

        // try getting a token
        let tokens = await getNewToken({
            grant_type: "authorization_code",
            redirect_uri: state.redirect_uri,
            code: params.get("code")!
        })

        if (!tokens)
            throw error(401, "Couldn't get initial token, code may be incorrect")

        // fetch userdata
        // could cache this, but lazy

        let userInfo = await (await fetchUserInfo(tokens.access_token)).json() as User

        // create a new token
        let newToken = await prisma.token.create({
            data: {
                token: tokens.access_token,
                refreshToken: tokens.refresh_token,
                owner: userInfo.sub
            }
        })

        token = newToken.id
        cookies.set("token", token, { path: "/" })
    }

    if (!token) return
    let userinfo = await getUserInfo(token)
    if (!userinfo) {
        cookies.delete("token", { path: "/" })
        deleteToken(token)
    }

    return userinfo
}