import { getMetadataForIdentifier } from '$lib/avatars.js';
import { error, redirect } from '@sveltejs/kit';

export async function GET({ params : { identifier } }) {
    let { source } = await getMetadataForIdentifier(identifier)
    let finalUrl: URL | string = `/info/${identifier}`
    
    if (source) {
        try {
            finalUrl = new URL(source)
        } catch {}
    }

    throw redirect(302, finalUrl)
}