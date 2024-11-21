<script lang="ts">
    import "@fontsource-variable/inter";
    import "@fontsource-variable/noto-sans-mono"
    import ava from "../assets/ava_icon.svg?raw"
	import type { User } from "$lib/types";
	import type { Snippet } from "svelte";
    interface Props {
        data: { user?: User };
        children?: Snippet;
    }

    let { data, children }: Props = $props();

    const buildName = `${__APP_NAME__} ${__APP_VERSION__}`
</script>
<svelte:head>
    <title>ava</title>
    <style>
        :root {
            --text: black;
            --link: #333;
            --background: white;
            --crust: #eee;
            --red: #d20f39;
            --yellow: #df8e1d;
            --green: #40a02b;
        }

        @media (prefers-color-scheme:dark) {
            :root {
                --text: white;
                --link: #aaa;
                --background: #111;
                --crust: #333;
                --red: #f38ba8;
                --yellow: #f9e2af;
                --green: #a6e3a1
            }
        }
        
        html {
            background: var(--background);
        }
        body {
            font-family: "Inter Variable", "Inter", sans-serif;
            max-width: 35em;
            margin: auto;
            color: var(--text);
            padding: 0 1em;
        }
        nav {
            display: flex;
            gap: 1em;
            justify-content: center;
            align-items: center;
            margin: 1em 0;
        }
        svg {
            width: .75em;
            height: .75em;
        }
        nav svg {
            width: 1.5em;
            height: 1.5em;
        }
        nav > * {
            display: flex; /* Flexbox fixes everything! */
        }
        a, small, footer {
            color: var(--link)
        }
        code, pre {
            font-family: "Space Mono", monospace, monospace;
        }
        footer {
            margin: 1em 0;
            text-align: center;
        }
    </style>
</svelte:head>
<nav>
    <a href="/">{@html ava}</a>
    <a href="/set">Set avatar</a>
    {#if data.user}
        <a href="/logout">Log out</a>
    {/if}
</nav>

{@render children?.()}

<footer>
    {import.meta.env.DEV ? "[DEV]" : ""}
    {buildName}
</footer>