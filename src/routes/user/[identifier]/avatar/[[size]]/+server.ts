import { getPathToAvatarForIdentifier } from '$lib/avatars.js';
import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import mime from "mime";

export async function GET({ params : { identifier, size }, url }) {
    let sz = size ? parseInt(size, 10) : undefined
    if (sz && Number.isNaN(sz))
        throw error(400, "Invalid number")

    let avPath = await getPathToAvatarForIdentifier(identifier, sz, url.searchParams.get("format") || undefined)
    
    if (!avPath)
        throw error(404, "Avatar at this size not found, or this is an invalid format")
    
    return new Response(await readFile(avPath), {
        headers: {
            "Content-Type": mime.getType(avPath) || ""
        }
    })
}