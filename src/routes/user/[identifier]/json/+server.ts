import { getMetadataForIdentifier } from '$lib/avatars.js';
import { error, redirect } from '@sveltejs/kit';

export async function GET({ params : { identifier } }) {
    return new Response(
        JSON.stringify(
            await getMetadataForIdentifier(identifier)
        ),
        {
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        }
    )
}