const configuration = {
    oauth2: {
        endpoints: {
            authenticate: process.env.OAUTH2__AUTHENTICATE,
            logout: process.env.OAUTH2__LOGOUT,
            token: process.env.OAUTH2__TOKEN
        },
        client: {
            id: process.env.OAUTH2__CLIENT_ID,
            secret: process.env.OAUTH2__CLIENT_SECRET
        }
    },
    userinfo: {
        route: process.env.USERINFO__ROUTE
    }
}
export default configuration