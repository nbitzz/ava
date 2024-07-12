import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { prisma } from "./clientsingleton"
import configuration from "./configuration"
import Sharp, { type FormatEnum } from "sharp"

// todo: make customizable
export const avatarDirectory = "./.data/avatars"
export const defaultAvatarDirectory = "./.data/defaultAvatar/"

await mkdir(defaultAvatarDirectory, { recursive: true })

export const missingAvatarQueue = new Map<
    string,
    Promise<string>
>()

/**
 * @description Generate an avatar at the selected size and format 
 * @param path Path to the avatar directory
 * @param size Avatar size
 * @param fmt Avatar format
 * @returns Promise that resolves to the path of the newly-generated avatar
 */
export function generateMissingAvatar(path: string, size: number, fmt?: keyof Sharp.FormatEnum) {
    let qid = JSON.stringify([path, size, fmt])
    if (missingAvatarQueue.has(qid))
        return missingAvatarQueue.get(qid)!

    let prom = new Promise<string>(async (res, rej) => {
        // locate best quality currently available
        const av = await readdir(path)
        // this can probably be done better but I DON'T GIVE A FUCK  !!!!
        const pathToBestQualityImg = 
            path == defaultAvatarDirectory
                ? "./assets/default.png"
                : join(
                    path,
                    av
                        .map(e => [parseInt(e.match(/(.*)\..*/)?.[1] || "", 10), e] as [number, string])
                        .sort(([a],[b]) => b - a)
                        [0][1]
                )
        
        const buf = await readFile(pathToBestQualityImg)
        res(writeAvatar(path, await renderAvatar(buf, size, fmt)))
        missingAvatarQueue.delete(qid)
    })

    missingAvatarQueue.set(qid, prom)
    return prom
}

/**
 * @description Get the path of an avatar for a user
 * @param uid UID of the user
 * @param size Avatar size
 * @param fmt Avatar format
 * @returns Path to the avatar of a user
 */
export async function getPathToAvatarForUid(uid?: string, size: number = configuration.images.default_resolution, fmt?: string) {
    if (uid?.includes("/"))
        throw Error("UID cannot include /")

    // check if format is valid
    if (![undefined, ...configuration.images.extra_output_types].includes(fmt as keyof FormatEnum))
        return

    // if no uid / no avatar folder then default to the default avatar directory
    let userAvatarDirectory = uid ? join(avatarDirectory, uid) : defaultAvatarDirectory
    if (!existsSync(userAvatarDirectory))
        userAvatarDirectory = defaultAvatarDirectory

    // bind a makeMissing function
    const makeMissing = generateMissingAvatar.bind(null, userAvatarDirectory, size, fmt as keyof FormatEnum)

    // get directory to extract imgs from
    let targetAvatarDirectory = join(userAvatarDirectory, fmt||"")

    // if there's no images for the specified fmt, generate new ones
    if (!existsSync(targetAvatarDirectory))
        return makeMissing()

    let sizes = await readdir(targetAvatarDirectory, {withFileTypes: true})

    const targetAvatar = sizes.filter(e => e.isFile()).find(
        s => parseInt(s.name.match(/(.*)\..*/)?.[1] || "", 10) == size
    )

    if (targetAvatar)
        return join(targetAvatarDirectory, targetAvatar.name)
    else if (configuration.images.output_resolutions.includes(size))
        return makeMissing() // generate image at this size for the specified format
}

export async function getPathToAvatarForIdentifier(identifier: string, size: number = configuration.images.default_resolution, fmt?: string) {
    let user = await prisma.user.findFirst({
        where: {
            identifier
        }
    })

    return getPathToAvatarForUid(user?.userId, size, fmt)
}

/**
 * @description Render an avatar at the specified size and format
 * @param bin Image to rerender
 * @param squareSize Target size of the new image
 * @param format Image target format
 * @returns Avatar buffer and other information which may be useful
 */
export async function renderAvatar(bin: ArrayBuffer|Buffer, squareSize: number, format?: keyof Sharp.FormatEnum) {
    const opBegin = Date.now()
    let img = Sharp(bin);
    let metadata = await img.metadata();
    let realSquareSize = Math.min(...[metadata.width, metadata.height].filter(e => e) as number[], squareSize)

    img.resize({
        width: realSquareSize,
        height: realSquareSize,
        fit: "cover"
    })

    if (format) img.toFormat(format)
    
    return {
        buf: await img.toBuffer(),
        extension: format || metadata.format,
        requestedFormat: format,
        squareSize,
        time: Date.now()-opBegin
    }
}

export async function writeAvatar(avatarDir: string, renderedAvatar: Awaited<ReturnType<typeof renderAvatar>>) {
    const targetDir = join(
            avatarDir,
            ...(
                renderedAvatar.requestedFormat
                ? [ renderedAvatar.requestedFormat ]
                : []
            )
        )

    await mkdir(targetDir, {recursive: true})

    const targetPath = join(
        targetDir,
        `${renderedAvatar.squareSize}.${renderedAvatar.extension}`
    )

    await writeFile(
        targetPath,
        renderedAvatar.buf
    )

    return targetPath
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

    let time: Record<number, Record<"input" | keyof Sharp.FormatEnum, number>> = {}

    // render all images and write to disk
    let avatarData = await avatar.arrayBuffer()
    for (let x of configuration.images.output_resolutions) {
        time[x] = Object.fromEntries([
            ["input", -1],
            ...configuration.images.extra_output_types
                    .map( e => [ e, -1 ] )
        ])
        for (let t of [undefined, ...configuration.images.extra_output_types]) {
            try {
                const rendered = await renderAvatar(avatarData, x, t)
                await writeAvatar(userAvatarDirectory, rendered)
                time[x][t || "input"] = rendered.time
            } catch (e) { // clear pfp and throw if error encountered
                await rm(userAvatarDirectory, { recursive: true, force: true })
                throw e
            }
        }
    }
    
    return time
}