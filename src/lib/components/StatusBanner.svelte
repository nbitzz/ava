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
        --color: #d20f39;
    }

    .warn {
        --color: #df8e1d;
    }

    .success {
        --color: #40a02b;
    }

    @media (prefers-color-scheme: dark) {
        .error {
            --color: #f38ba8;
        }

        .warn {
            --color: #f9e2af;
        }

        .success {
            --color: #a6e3a1;
        }
    }
</style>
<div class={status}>
    {@render children()}
</div>