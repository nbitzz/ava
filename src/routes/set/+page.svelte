<script lang="ts">
	import type { User } from "$lib/types";
	import FilePreviewSet from "./FilePreviewSet.svelte";

    export let data: {user: User, url: string, allowedImageTypes: string[]};
    let files: FileList;
    let fileSrc = `/avatar/${data.user.identifier}/`
    
    $: if (files && files.length >= 0) {
        console.log(files.length)
        fileSrc = URL.createObjectURL(files.item(0)!)
    } else fileSrc = `/avatar/${data.user.identifier}/`
</script>

<style>
    form {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    form > * {
        font-family: "Inter Variable", "Inter", sans-serif;
    }
    form > input[type="file"] {
        width: 100%;
    }
    form > input[type="submit"], form > input[type="file"] {
        padding: 0.5em 1em;
        cursor: pointer;
        border-radius: 8px;
        border: 1px solid var(--link);
        color: var(--text);
        background-color: var(--crust);
    }
    form > input[type="file"]::file-selector-button {
        display: none;
    }
    form > label {
        flex-shrink: 0;
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
                {#each ["", "32", "64", "128", "256", "512"] as variant}
                    <li>{new URL(`/avatar/${data.user.identifier}/${variant}`, data.url)}</li>
                {/each}
            </ul>
        </div>
    </details>
</p>
<form method="post" enctype="multipart/form-data">
    <label for="newAvatar">Set a new avatar &#x279C;</label>
    <input type="file" bind:files={files} accept={data.allowedImageTypes.join(",")} name="newAvatar">
    <input type="submit" value="Upload">
</form>
{#key fileSrc}
    <br>
    <FilePreviewSet avatarUrl={fileSrc} style="border-radius:8px;"  />
    <br>
    <FilePreviewSet avatarUrl={fileSrc} style="border-radius:100%;" />
{/key}