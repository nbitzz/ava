<script lang="ts">
	import StatusBanner from "$lib/components/StatusBanner.svelte";
    import type { User } from "$lib/types";
	import FilePreviewSet from "$lib/components/FilePreviewSet.svelte";
    import ReversibleHeading from "$lib/components/ReversibleHeading.svelte"

    export interface Props {
        data: {
            user: User,
            allowedImageTypes: string[], 
            renderSizes: number[]
        };
        form: { success: true, message: string } | { success: false, error: string } | undefined;
    }

    let { data = $bindable(), form }: Props = $props();
    let files: FileList | undefined = $state();
    let fileSrc = $derived(files && files.length >= 0 ? URL.createObjectURL(files.item(0)!) : "")
    
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
</style>

<ReversibleHeading to="/set">Add a new avatar</ReversibleHeading>
<br>
{#if form}
    {#if !form.success}
        <StatusBanner status="error">{form.error}</StatusBanner>
        <br>
    {/if}
{/if}
<form method="post" enctype="multipart/form-data">
    <input type="file" bind:files={files} accept={data.allowedImageTypes.join(",")} name="newAvatar">
    <div class="metadata">
        <textarea name="altText" placeholder="Describe your image"></textarea>
        <textarea name="source" placeholder="Provide a source for your image"></textarea>
    </div>
    {#if fileSrc}
        <br>
        <FilePreviewSet avatarUrl={fileSrc} style="border-radius:8px;"  />
        <br>
        <FilePreviewSet avatarUrl={fileSrc} style="border-radius:100%;" />
    {/if}
    <div class="buttons">
        <input type="submit" name="action" value="Create">
    </div>
</form>