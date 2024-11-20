<script lang="ts">
	import FilePreviewSet from "../../../lib/components/FilePreviewSet.svelte";

    interface Props {
        data: {
            identifier: string,
            name: string,
            altText: string,
            source: string
        };
    }

    let { data }: Props = $props();
</script>

<style>
    h2, p {
        margin: 0;
    }

    h2 {
        font-weight: normal;
        color: var(--link);
        font-size: 0.82em;
    }
</style>

<h1>{data.name}'s avatar</h1>
<FilePreviewSet avatarUrl="/user/{data.identifier}/avatar" style="border-radius:8px;"  />
<br>
<FilePreviewSet avatarUrl="/user/{data.identifier}/avatar" style="border-radius:100%;" />
<br>

<h2>Alt text</h2>
<p>
    {#if data.altText}
        {data.altText}
    {:else}
        <em>No alt text available</em>
    {/if}
</p>
<br>

<h2>Source</h2>
<p>
    {#if data.source}
        {data.source}
    {:else}
        <em>No source available</em>
    {/if}
</p>