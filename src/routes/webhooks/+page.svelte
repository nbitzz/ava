<script lang="ts">
	import StatusBanner from "$lib/components/StatusBanner.svelte";
    import type { User } from "$lib/types";
	import FilePreviewSet from "$lib/components/FilePreviewSet.svelte";
    import ReversibleHeading from "$lib/components/ReversibleHeading.svelte"

    export interface Props {
        data: {
            user: User,
            webhooks: {id: string, url: string, enabled: boolean}[]
        };
        form: { success: true, message: string } | { success: false, error: string } | undefined;
    }

    let { data = $bindable(), form }: Props = $props();
    let files: FileList | undefined = $state();
    let fileSrc = $derived(files && files.length >= 0 ? URL.createObjectURL(files.item(0)!) : "")
    
</script>

<style>
    form {
        display: flex;
        gap: 10px;
    }
    form > input[type="url"] {
        flex-basis: 100%;
        min-height: 1em;
    }
    form input[type="submit"], form {
        cursor: pointer;
    }
    /*form input[name="id"] {
        display: none;
    }*/
    form input {
        font-family: "Inter Variable", "Inter", sans-serif;
        padding: 0.5em 1em;
        border-radius: 8px;
        border: 1px solid var(--link);
        color: var(--text);
        background-color: var(--crust);
    }
    form input[type="submit"].enabled {
        border: 1px solid var(--green);
        background-color: color-mix(in srgb, var(--green) 20%, var(--background) 80%);
        color: var(--green);
    }
    form input[type="submit"].disabled {
        border: 1px solid var(--text);
        background-color: var(--background);
        opacity: 0.25;
    }
    form input[type="submit"].disabled, form input[type="submit"].enabled {
        font-size: 1;
        padding: 0.25em .5em;
        flex-shrink: 0;
        aspect-ratio: 1 / 1;
    }
    div {
        display: flex;
        flex-direction: column;
        gap: .5em;
    }
</style>

<ReversibleHeading to="/set">Manage webhooks</ReversibleHeading>
{#if form}
    <br>
    <StatusBanner status={form.success ? "success" : "error"}>{form.success ? form.message : form.error}</StatusBanner>
    <br>
{/if}
<div>
    {#each data.webhooks as webhook}
        <form method="post" enctype="multipart/form-data" action="?/manage">
            <input type="submit" name="toggle" class="{webhook.enabled ? "enabled" : "disabled"}" value="⏻" aria-label={webhook.enabled ? "Enabled" : "Disabled"}>
            <input type="url" name="url" readonly value={webhook.url}>
            <input type="submit" name="action" value="Delete">
        </form>
    {/each}
</div>
<br>
<form method="post" enctype="multipart/form-data" action="?/create">
    <input type="url" name="url" placeholder="URL">
    <input type="submit" name="action" value="Add">
</form>
<br>
<hr>
<br>
URLs added to this page will be sent a POST request with the following payload when you change or edit your current profile picture:
<pre>
{`{
    "id": string
    "host": string
    "altText": string
    "source": string
    "default": boolean
}`}
</pre>