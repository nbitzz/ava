<script lang="ts">
	import StatusBanner from "$lib/components/StatusBanner.svelte";
    import type { User } from "$lib/types";
	import FilePreviewSet from "$lib/components/FilePreviewSet.svelte";
    import ReversibleHeading from "$lib/components/ReversibleHeading.svelte"

    export interface Props {
        data: {
            user: User,
            url: string,
            avatar: {
                id: string,
                altText?: string,
                source?: string
            }
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
    form input[type="submit"], form textarea {
        padding: 0.5em 1em;
        border-radius: 8px;
        border: 1px solid var(--link);
        color: var(--text);
        background-color: var(--crust);
    }
    form input[type="submit"]{
        cursor: pointer;
    }
    form textarea:disabled {
        color: var(--link);
    }
    form input[type="submit"][value="Delete"] {
        border: 1px solid var(--red);
        background-color: color-mix(in srgb, var(--red) 20%, var(--background) 80%);
        color: var(--red);
        margin-right: auto;
    }
</style>

<ReversibleHeading to="/set">
    Edit avatar
    {#snippet subheading()}
        <code>{data.avatar.id}</code>
    {/snippet}
</ReversibleHeading>
<FilePreviewSet avatarUrl="{data.url}/image" style="border-radius:8px;"  />
<br>
<FilePreviewSet avatarUrl="{data.url}/image" style="border-radius:100%;" />
<br>
{#if form}
    {#if !form.success}
        <StatusBanner status="error">{form.error}</StatusBanner>
        <br>
    {/if}
{/if}
<form method="post" enctype="multipart/form-data">
    <div class="metadata">
        <textarea name="altText" placeholder="Describe your image">{data.avatar.altText}</textarea>
        <textarea name="source" placeholder="Provide a source for your image">{data.avatar.source}</textarea>
    </div>
    <div class="buttons">
        <input type="submit" name="action" value="Delete">
        <input type="submit" name="action" value="Save">
    </div>
</form>