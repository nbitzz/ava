const configuration = {
    oauth2: {
        endpoints: {
            authenticate: process.env.OAUTH2__AUTHENTICATE,
            logout: process.env.OAUTH2__LOGOUT,
            token: process.env.OAUTH2__GET_TOKEN
        },
        client: {
            id: process.env.OAUTH2__CLIENT_ID,
            secret: process.env.OAUTH2__CLIENT_SECRET,
            scopes: process.env.OAUTH2__SCOPES
        }
    },
    userinfo: {
        route: process.env.USERINFO__ROUTE,
        identifier: process.env.USERINFO__IDENTIFIER
    },
    allowed_types: process.env.ALLOWED_TYPES.split(",")
}
export default configuration