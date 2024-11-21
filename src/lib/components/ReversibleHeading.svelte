<script lang="ts">
    import back from "@fluentui/svg-icons/icons/arrow_left_32_regular.svg?raw"
    import type { Snippet } from "svelte"

    let {to, children, subheading}:{to: string, children: Snippet, subheading?: Snippet} = $props()
</script>

<style>
    a {
        text-decoration: none;
        fill: var(--link);
        display: flex;
    }
    div {
        display: flex;
        align-items: center;
        gap: 1em;
    }
    .subheading {
        font-size: 0.5em;
        color: var(--link);
        display: block;
    }
</style>

<div>
    <a href={to}>
        {@html back.replace("svg", "svg style=\"width: 2em; height: 2em; vertical-align:middle;\"").replace(">", "><title>Go back</title>")}
    </a>
    <h1>
        {@render children()}
        {#if subheading}
            <span class="subheading">
                {@render subheading()}
            </span>
        {/if}
    </h1>
</div>