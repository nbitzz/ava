<script lang="ts">
	import type { User } from "$lib/types";
	import FilePreviewSet from "./FilePreviewSet.svelte";

    export let data: {
        user: User,
        url: string,
        avatar: {
            altText: string,
            source: string,
            default: boolean
        }
        allowedImageTypes: string[], 
        renderSizes: number[]
    };
    export let form: { success: true, message: string } | { success: false, error: string } | undefined;
    let files: FileList;
    let fileSrc = `/avatar/${data.user.identifier}/`
    
    $: if (files && files.length >= 0) {
        data.avatar.altText = "", data.avatar.source = "", data.avatar.default = false
        fileSrc = URL.createObjectURL(files.item(0)!)
    } else fileSrc = `/avatar/${data.user.identifier}/`
</script>

<style>
    form {
        flex-direction: column;
    }
    form, form > .buttons, form > .metadata {
        display: flex;
        gap: 10px;
    }
    form > .metadata {
        flex-wrap: wrap;
    }
    form > .metadata > textarea {
        height: 3em;
        flex-grow: 1;
        min-width: 15em;
    }
    form > .buttons {
        justify-content: flex-end;
    }
    form input {
        font-family: "Inter Variable", "Inter", sans-serif;
    }
    form > input[type="file"] {
        flex-basis: 100%;
        min-height: 1em;
    }
    form input[type="submit"], form input[type="file"] {
        cursor: pointer;
    }
    form input[type="submit"], form input[type="file"], form textarea {
        padding: 0.5em 1em;
        border-radius: 8px;
        border: 1px solid var(--link);
        color: var(--text);
        background-color: var(--crust);
    }
    form textarea:disabled {
        color: var(--link);
    }
    form > input[type="file"]::file-selector-button {
        display: none;
    }
    summary::marker {
        content: ""
    }
    summary {
        color: var(--link);
        cursor:pointer;
    }
    details > div {
        border-left: 0.25em solid var(--link);
        padding: 0 1em;
        overflow-x: auto;
        background-color: var(--crust);
        width: calc( 100% - 2em );
    }
</style>

<h1>Hi, {data.user.name}</h1>
<p>
    <details>
        <summary>View user information...</summary>
        <div>
            <pre>{JSON.stringify(data.user, null, 4)}</pre>
        </div>
    </details>
    <details>
        <summary>Avatar URLs...</summary>
        <div>
            <ul>
                {#each ["", ...data.renderSizes] as variant}
                    <li>{new URL(`/avatar/${data.user.identifier}/${variant}`, data.url)}</li>
                {/each}
            </ul>
        </div>
    </details>
</p>
<form method="post" enctype="multipart/form-data">
    <input type="file" bind:files={files} accept={data.allowedImageTypes.join(",")} name="newAvatar">
    <div class="metadata">
        <textarea name="altText" placeholder="Describe your image" disabled={data.avatar.default}>{data.avatar.altText}</textarea>
        <textarea name="source" placeholder="Provide a source for your image" disabled={data.avatar.default}>{data.avatar.source}</textarea>
    </div>
    <div class="buttons">
        <input type="submit" name="action" value="Save">
        <input type="submit" name="action" value="Clear">
    </div>
</form>
{#if form}
    {#if form.success}
        <details>
            <summary><small>Avatar updated successfully</small></summary>
            <div>
                <pre>{form.message}</pre>
            </div>
        </details>
    {:else}
        <small>An error occurred: {form.error}</small>
    {/if}
{/if}
{#key fileSrc}
    <br>
    <FilePreviewSet avatarUrl={fileSrc} style="border-radius:8px;"  />
    <br>
    <FilePreviewSet avatarUrl={fileSrc} style="border-radius:100%;" />
{/key}