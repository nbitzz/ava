import { mkdir, readdir, rm } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { prisma } from "./clientsingleton"
import configuration from "./configuration"
import { Magick, MagickCore } from "magickwand.js"
import mime from "mime"

Magick.SetSecurityPolicy(await Bun.file('./imagemagick.policy.xml').text())

// todo: make customizable
export const avatarDirectory = "./.data/avatars"
export const defaultAvatarDirectory = "./static/default/"
export const renderSizes = [ 1024, 512, 256, 128, 64, 32 ]

export async function getPathToAvatarForUid(uid?: string, size: string = "512") {
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

export async function getPathToAvatarForIdentifier(identifier: string, size: string = "512") {
    let user = await prisma.user.findFirst({
        where: {
            identifier
        }
    })

    return getPathToAvatarForUid(user?.userId, size)
}

export async function rerenderAvatar(bin: ArrayBuffer, squareSize?: number) {
    let img = new Magick.Image;
    // read file
    await img.readAsync(new Magick.Blob(bin),"")
    if (squareSize) {
        // resize, but don't upscale, while filling without squishing
        await img.scaleAsync(`${squareSize}x${squareSize}^>`)
    }
    // center crop
    const size = img.size()
    squareSize = Math.min(size.width(), size.height())
    await img.extentAsync(`${squareSize}x${squareSize}`, MagickCore.CenterGravity)
    
    // return avatar buffer
    let tempBlob = new Magick.Blob()
    await img.writeAsync(tempBlob)
    return tempBlob.dataAsync()
}

export async function setNewAvatar(uid: string, avatar?: File) {
    if (uid?.includes("/"))
        throw Error("UID cannot include /")
    
    // Delete current avatar directory
    const userAvatarDirectory = join(avatarDirectory, uid)
    await rm(userAvatarDirectory, { recursive: true, force: true })

    if (!avatar) return {} // we don't need to set a new one
    
    // make a new directory
    mkdir(userAvatarDirectory, { recursive: true })

    let time: Record<number, number> = {}

    // render all images and write to disk
    let avatarData = await avatar.arrayBuffer()
    let fileExtension = mime.getExtension(avatar.type)
    for (let x of renderSizes) {
        console.log(x)
        try {
            let start = Date.now()
            let rerenderedAvatarData = await rerenderAvatar(avatarData, x)
            await Bun.write(
                join(userAvatarDirectory, `${x}.${fileExtension}`),
                rerenderedAvatarData
            )
            time[x] = Date.now()-start
        } catch (e) { // clear pfp and throw if error encountered
            await rm(userAvatarDirectory, { recursive: true, force: true })
            throw e
        }
    }
    
    return time
}