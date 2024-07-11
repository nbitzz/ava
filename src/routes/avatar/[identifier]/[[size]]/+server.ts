import { getPathToAvatarForIdentifier } from '$lib/avatars.js';
import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import mime from "mime";

export async function GET({ params : { identifier, size } }) {
    let avPath = await getPathToAvatarForIdentifier(identifier, size)
    
    if (!avPath)
        throw error(404, "Avatar at this size not found")
    
    return new Response(await readFile(avPath), {
        headers: {
            "Content-Type": mime.getType(avPath) || ""
        }
    })
}