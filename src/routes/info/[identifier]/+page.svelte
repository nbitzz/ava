<script lang="ts">
	import FilePreviewSet from "../../set/FilePreviewSet.svelte";

    export let data: {
        identifier: string,
        name: string,
        altText: string,
        source: string
    };
</script>

<style>
    h5, p {
        margin: 0;
    }

    h5 {
        font-weight: normal;
        color: var(--link)
    }
</style>

<h1>{data.name}'s avatar</h1>
<FilePreviewSet avatarUrl="/avatar/{data.identifier}" style="border-radius:8px;"  />
<br>
<FilePreviewSet avatarUrl="/avatar/{data.identifier}" style="border-radius:100%;" />
<br>

<h5>Alt text</h5>
<p>
    {#if data.altText}
        {data.altText}
    {:else}
        <em>No alt text available</em>
    {/if}
</p>
<br>

<h5>Source</h5>
<p>
    {#if data.source}
        {data.source}
    {:else}
        <em>No source available</em>
    {/if}
</p>