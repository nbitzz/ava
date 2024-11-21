import Sharp, { type FormatEnum } from "sharp"
import { env } from "$env/dynamic/private"
const stbool = (s: string) => {
    switch (s.toLowerCase()) {
        case "1":
        case "y":
        case "yes":
        case "true":
            return true

        case "0":
        case "n":
        case "no":
        case "false":
            return false

        default:
            return undefined
    }
}
const configuration = {
    oauth2: {
        endpoints: {
            authenticate: env.OAUTH2__AUTHENTICATE!,
            logout: env.OAUTH2__LOGOUT,
            token: env.OAUTH2__GET_TOKEN!,
        },
        client: {
            id: env.OAUTH2__CLIENT_ID!,
            secret: env.OAUTH2__CLIENT_SECRET!,
            scopes: env.OAUTH2__SCOPES!,
        },
    },
    userinfo: {
        route: env.USERINFO__ROUTE!,
        identifier: env.USERINFO__IDENTIFIER!,
    },
    images: {
        permitted_input:
            (env.ALLOWED_TYPES || env.IMAGES__ALLOWED_INPUT_FORMATS)?.split(
                ","
            ) || [],
        default_resolution:
            parseInt((env.IMAGES__DEFAULT_RESOLUTION || "").toString(), 10) ||
            512,
        extra_output_types:
            (env.IMAGES__EXTRA_OUTPUT_FORMATS?.split(",").filter(
                e => e in Sharp.format
            ) as (keyof FormatEnum)[]) || [],
        output_resolutions: env.IMAGES__OUTPUT_RESOLUTIONS?.split(",").map(e =>
            parseInt(e, 10)
        ) || [1024, 512, 256, 128, 64, 32],
    },
    ...(stbool(env.LIBRAVATAR__ENABLED) ?? false
        ? {
              libravatar: {
                  output_format: (["png", "jpeg"].includes(
                      env.LIBRAVATAR__FORMAT
                  )
                      ? env.LIBRAVATAR__FORMAT
                      : "jpeg") as keyof FormatEnum,
                  resize_mode: ["round", "nocache", "cache"].includes(
                      env.LIBRAVATAR__GENERATION_MODE
                  )
                      ? env.LIBRAVATAR__GENERATION_MODE
                      : "round",
              },
          }
        : {}),
}

// add extra output format if required
if (
    configuration.libravatar &&
    !configuration.images.extra_output_types.includes(
        configuration.libravatar.output_format
    )
)
    configuration.images.extra_output_types.push(
        configuration.libravatar.output_format
    )

export default configuration
