import Sharp, { type FormatEnum } from 'sharp';
import { env } from '$env/dynamic/private';
const configuration = {
	oauth2: {
		endpoints: {
			authenticate: env.OAUTH2__AUTHENTICATE!,
			logout: env.OAUTH2__LOGOUT,
			token: env.OAUTH2__GET_TOKEN!
		},
		client: {
			id: env.OAUTH2__CLIENT_ID!,
			secret: env.OAUTH2__CLIENT_SECRET!,
			scopes: env.OAUTH2__SCOPES!
		}
	},
	userinfo: {
		route: env.USERINFO__ROUTE!,
		identifier: env.USERINFO__IDENTIFIER!
	},
	images: {
		permitted_input: (env.ALLOWED_TYPES || env.IMAGES__ALLOWED_INPUT_FORMATS)?.split(',') || [],
		default_resolution: parseInt((env.IMAGES__DEFAULT_RESOLUTION || '').toString(), 10) || 512,
		extra_output_types:
			(env.IMAGES__EXTRA_OUTPUT_FORMATS?.split(',').filter(
				(e) => e in Sharp.format
			) as (keyof FormatEnum)[]) || [],
		output_resolutions: env.IMAGES__OUTPUT_RESOLUTIONS?.split(',').map((e) => parseInt(e, 10)) || [
			1024, 512, 256, 128, 64, 32
		]
	}
};
export default configuration;
