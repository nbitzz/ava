import {
    avatarDirectory,
    getAvailableSizesInPath,
    getPathToAvatar,
    getPathToAvatarForIdentifier,
    renderAvatar,
} from "$lib/avatars.js"
import { prisma } from "$lib/clientsingleton.js"
import configuration from "$lib/configuration.js"
import { getRequestUser } from "$lib/oidc.js"
import { error, redirect } from "@sveltejs/kit"
import { readFile } from "fs/promises"
import mime from "mime"
import { join } from "path"

export async function GET({ params: { hash }, url }) {
    if (!configuration.libravatar)
        throw error(501, "The libravatar API is disabled on this server")

    const requestedSize = parseInt(url.searchParams.get("s") || "0", 10) || 80
    const fallback = url.searchParams.get("d") || "mm"
    const forceDefault = url.searchParams.get("f") === "y"
    const hashBinary = Buffer.from(hash, "hex")
    let size = requestedSize > 512 || requestedSize < 1 ? 80 : requestedSize

    // try to find the user from the hashBinary

    const avatarId = (
        await prisma.emailHashes.findFirst({
            where: {
                OR: [
                    {
                        sha256: hashBinary,
                    },
                    {
                        md5: hashBinary,
                    },
                ],
            },
            select: {
                user: {
                    select: {
                        currentAvatarId: true,
                    },
                },
            },
        })
    )?.user.currentAvatarId

    let avPath: string | undefined

    if (!forceDefault && avatarId)
        switch (configuration.libravatar.resize_mode) {
            case "nearest":
                // find nearest size available
                size = configuration.images.output_resolutions.includes(size)
                    ? size
                    : configuration.images.output_resolutions
                          .slice()
                          .sort(
                              (a, b) => Math.abs(size - a) - Math.abs(size - b)
                          )[0]
            // don't break here so it goes into the cache case
            case "cache":
                // get path to avatar
                avPath = await getPathToAvatar(
                    avatarId,
                    size,
                    configuration.libravatar.output_format,
                    // bypass size limits if cache
                    // nearest shouldn't trigger this anyway but just in case
                    configuration.libravatar.resize_mode == "cache"
                )
                break
            case "nocache":
                const avatarPath = join(avatarDirectory, avatarId),
                    avImgs = await getAvailableSizesInPath(avatarPath),
                    avImageSizes = avImgs.map(e => e[0])

                if (!avImageSizes.includes(size)) {
                    // we need to scale down
                    // find the next largest image resolution
                    let sortedSizes = [...avImageSizes, size].sort(
                        (a, b) => a - b
                    )

                    // try to get higher res if exists, otherwise get lower
                    let scaleDownFrom = join(
                        avatarPath,
                        avImgs[
                            avImageSizes.indexOf(
                                sortedSizes[sortedSizes.indexOf(size) + 1] ||
                                    sortedSizes[sortedSizes.indexOf(size) - 1]
                            )
                        ][1]
                    )

                    // render an avatar
                    let avatar = await renderAvatar(
                        await readFile(scaleDownFrom),
                        size,
                        configuration.libravatar.output_format
                    )

                    // serve image
                    return new Response(await avatar.img.toBuffer(), {
                        headers: {
                            "Content-Type":
                                mime.getType(avatar.extension!) || "",
                        },
                    })
                } else {
                    // we don't need to scale down. serve this image
                    avPath = join(
                        avatarPath,
                        avImgs[avImageSizes.indexOf(size)][1]
                    )
                }
        }

    if (!avPath) {
        switch (fallback) {
            case "404":
                throw error(404, "Avatar not found")
            case "mm":
            case "mp":
                // TODO: serve a default image at the correct size
                throw redirect(302, "/avatars/default/image")
            default:
                throw redirect(302, fallback)
        }
    }

    return new Response(await readFile(avPath), {
        headers: {
            "Content-Type": mime.getType(avPath) || "",
        },
    })
}
