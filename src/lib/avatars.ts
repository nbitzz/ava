import { readdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { basename, join } from "node:path"
import { prisma } from "./clientsingleton"

// todo: make customizable
export const avatarDirectory = "./.data/avatars"
export const defaultAvatarDirectory = "./static/default/"
export const renderSizes = [ 512, 256, 128, 64, 32 ]

export async function getPathToAvatarForUid(uid?: string, size: string = "index") {
    if (uid?.includes("/"))
        throw Error("UID cannot include /")

    let userAvatarDirectory = uid ? join(avatarDirectory, uid) : defaultAvatarDirectory
    if (!existsSync(userAvatarDirectory))
        userAvatarDirectory = defaultAvatarDirectory

    let sizes = await readdir(userAvatarDirectory)
    const targetAvatar = sizes.find(s => s.match(/(.*)\..*/)?.[1] == size)
    if (targetAvatar)
        return join(userAvatarDirectory, targetAvatar)
}

export async function getPathToAvatarForIdentifier(identifier: string, size: string = "index") {
    let user = await prisma.user.findFirst({
        where: {
            identifier
        }
    })

    return getPathToAvatarForUid(user?.userId || "", size)
}