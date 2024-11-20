<script lang="ts">
    import type { Snippet } from "svelte";

    const { status, children }: { status: "success" | "warn" | "error", children: Snippet } = $props()
</script>
<style>
    div {
        border-bottom: 2px solid var(--color);
        background-color: color-mix(in srgb, var(--color) 20%, var(--background) 80%);
        text-align: center;
        padding: 10px;
    }

    .error {
        --color: var(--red);
    }

    .warn {
        --color: var(--yellow);
    }

    .success {
        --color: var(--green);
    }
</style>
<div class={status}>
    {@render children()}
</div>