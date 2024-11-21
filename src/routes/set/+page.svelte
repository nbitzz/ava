<script lang="ts">
	import StatusBanner from "$lib/components/StatusBanner.svelte";
    import type { User } from "$lib/types";
    import type { Avatar } from "@prisma/client";
    import editIcon from "@fluentui/svg-icons/icons/pen_16_regular.svg?raw"

    export interface Props {
        data: {
            user: User,
            url: string,
            avatars: (Avatar & {inUse: boolean})[]
        };
        form: { success: true, message: string } | { success: false, error: string } | undefined;
    }
	import FilePreviewSet from "$lib/components/FilePreviewSet.svelte";

    let { data = $bindable(), form }: Props = $props();
</script>

<style>
    form {
        display: flex;
        justify-content: center;
        gap: 1em;
        flex-wrap: wrap;
    }
    input[type="submit"] {
        width: 7em;
        height: 7em;
        aspect-ratio: 1 / 1;
        border-radius: 8px;
        border: none;
        cursor:pointer;
        color: transparent;
    }
    .editButton {
        border: 1px solid var(--crust);
        padding: 5px;
        aspect-ratio: 1 / 1;
        border-radius: 8px;
        cursor: pointer;
        background-color: var(--background);
        fill: var(--text);
        width: 16px;
        height: 16px;
        display:flex; /* flex fixes everything! */
        opacity: 0;
        transition-duration: 150ms;
        position: absolute;
        left: 100%;
        top: 5px;
        transform: translateX(calc( -100% - 5px ))
    }
    .editButton:hover {
        border: 1px solid var(--link)
    }
    .idiv:hover .editButton {
        opacity: 1;
    }
    .idiv {
        position: relative
    }
    /* keep editbutton visible on mobile */
    @media (hover: none) {
        .editButton {
            opacity: 1
        }
    }
</style>

<h1>Hi, {data.user.name}</h1>
<br>
<FilePreviewSet avatarUrl="/user/{data.user.identifier}/avatar" style="border-radius:8px;"  />
<br>
<FilePreviewSet avatarUrl="/user/{data.user.identifier}/avatar" style="border-radius:100%;" />
<br>
{#if form}
    <StatusBanner status={form.success ? "success" : "error"}>{form.success ? form.message : form.error}</StatusBanner>
{/if}
<h2>Your avatars</h2>
<form method="post">
    {#each data.avatars as avatar}
        <div class="idiv">
            <input type="submit" name="action" value={"Set:"+avatar.id} aria-label={avatar.altText || "No alt text set"} style:background="center / cover no-repeat url('/avatars/{avatar.id}/image')" data-in-use={avatar.inUse} />
            <a href="/avatars/{avatar.id}" aria-label="Edit" class="editButton">
                {@html editIcon.replace("svg", "svg style=\"width: 16px; height: 16px;\"")}
            </a>
        </div>
    {/each}
    <input type="submit" name="action" value="Clear" aria-label="Default avatar" style:background="center / cover no-repeat url('/avatars/default/image')" />
</form>
<footer>
    <a href="/new">Add new avatar</a>
    &bullet;
    <a href="/webhooks">Webhooks</a>
    &bullet;
    <a href="/user/{data.user.identifier}" target="_blank">See user page</a>
</footer>