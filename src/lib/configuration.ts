import { format, type FormatEnum } from "sharp"
const configuration = {
    oauth2: {
        endpoints: {
            authenticate: process.env.OAUTH2__AUTHENTICATE!,
            logout: process.env.OAUTH2__LOGOUT,
            token: process.env.OAUTH2__GET_TOKEN!
        },
        client: {
            id: process.env.OAUTH2__CLIENT_ID!,
            secret: process.env.OAUTH2__CLIENT_SECRET!,
            scopes: process.env.OAUTH2__SCOPES!
        }
    },
    userinfo: {
        route: process.env.USERINFO__ROUTE!,
        identifier: process.env.USERINFO__IDENTIFIER!
    },
    images: {
        permitted_input: 
            (
                process.env.ALLOWED_TYPES 
                || process.env.IMAGES__ALLOWED_INPUT_FORMATS
            )?.split(",") || [],
        default_resolution: parseInt((process.env.IMAGES__DEFAULT_RESOLUTION || "").toString(), 10) || 512,
        extra_output_types: 
            process.env.IMAGES__EXTRA_OUTPUT_FORMATS
                ?.split(",")
                .filter(e => e in format) as (keyof FormatEnum)[]
                || [],
        output_resolutions: 
            process.env.IMAGES__OUTPUT_RESOLUTIONS
                ?.split(",")
                .map(e => parseInt(e,10)) 
                || [ 1024, 512, 256, 128, 64, 32 ]
    }
}
export default configuration