import { getMetadataForIdentifier } from "$lib/avatars.js"
import { prisma } from "$lib/clientsingleton.js"
import { error, redirect } from "@sveltejs/kit"

export async function load({ params: { identifier } }) {
    let userInfo = await prisma.user.findFirst({ where: { identifier } })
    if (!userInfo) throw error(404, "User not found")
    let metadata = await getMetadataForIdentifier(identifier)
    return {
        name: userInfo.name || identifier,
        identifier,
        ...metadata,
    }
}
