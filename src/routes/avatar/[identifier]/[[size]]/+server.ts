import { getPathToAvatarForIdentifier } from '$lib/avatars.js';
import { error } from '@sveltejs/kit';

export async function GET({ params : { identifier, size } }) {
    let avPath = await getPathToAvatarForIdentifier(identifier, size)
    
    if (!avPath)
        throw error(404, "Avatar at this size not found")
    
    return new Response(Bun.file(avPath))
}