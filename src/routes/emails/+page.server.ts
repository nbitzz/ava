import { getRequestUser, launchLogin } from "$lib/oidc"
import configuration from "$lib/configuration.js"
import { fail, redirect } from "@sveltejs/kit"
import {
    avatarDirectory,
    createNewAvatar,
    getMetadataForUserId,
} from "$lib/avatars.js"
import { join } from "path"
import { prisma } from "$lib/clientsingleton"
import { URL_REGEX } from "$lib/common.js"
import crypto from "node:crypto"
export async function load({ request, parent, url }) {
    const { user } = await parent()
    if (!user) return launchLogin(url.toString())

    return {
        url: url.toString(),
        emails: (
            await prisma.emailHashes.findMany({
                where: { forUserId: user.sub },
            })
        ).map(e =>
            Object.fromEntries([
                ...Object.entries(e).filter(([k]) =>
                    ["email", "id"].includes(k)
                ),
                ["isPrimary", Boolean(e.isPrimaryForUserId)],
            ])
        ),
    }
}

export const actions = {
    create: async ({ request, cookies }) => {
        let user = await getRequestUser(request, cookies)
        if (!user) return fail(401, { error: "unauthenticated" })

        let { email } = Object.fromEntries((await request.formData()).entries())

        if (!email || email instanceof File)
            return fail(400, { error: "no email supplied" })

        email = email.toLowerCase()

        const sha256 = crypto.createHash("sha256").update(email).digest(),
            md5 = crypto.createHash("md5").update(email).digest()

        // check hashes because 2.0 didn't store email string
        let { user: ownedBy } =
            (await prisma.emailHashes.findUnique({
                where: {
                    sha256_md5: {
                        sha256,
                        md5,
                    },
                },
                select: {
                    user: {
                        select: {
                            name: true,
                            identifier: true,
                        },
                    },
                },
            })) || {}

        if (ownedBy)
            return fail(409, {
                error: `Email already owned by ${user.name} (${user.identifier})`,
            })

        await prisma.emailHashes.create({
            data: {
                email,
                sha256,
                md5,
                forUserId: user.sub,
            },
        })

        return {
            success: true,
            message: "Email claimed",
        }
    },
    manage: async ({ request, cookies }) => {
        let user = await getRequestUser(request, cookies)
        if (!user) return fail(401, { error: "unauthenticated" })

        let { action, id } = Object.fromEntries(
            (await request.formData()).entries()
        )

        if (!id || id instanceof File)
            return fail(400, { error: "No email supplied" })

        id = id.toLowerCase()

        let emhash = await prisma.emailHashes.findUnique({
            where: {
                id,
                forUserId: user.sub,
            },
        })

        if (!emhash) return fail(404, { error: "Email doesn't exist" })

        if (emhash.isPrimaryForUserId == user.sub)
            return fail(403, { error: "You can't delete the primary email" })

        if (action == "Delete") {
            await prisma.emailHashes.delete({
                where: {
                    id,
                    forUserId: user.sub,
                },
            })

            return {
                success: true,
                message: "Email removed from account",
            }
        }
    },
}
