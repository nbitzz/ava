<script lang="ts">
    import "@fontsource-variable/inter";
    import "@fontsource-variable/noto-sans-mono"
    import ava from "../assets/ava_icon.svg?raw"
	import type { User } from "$lib/types";
    export let data: { user?: User };
</script>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ava</title>
        <style>
            :root {
                --text: black;
                --link: #333;
                --background: white;
                --crust: #eee;
            }
            @media (prefers-color-scheme:dark) {
                :root {
                    --text: white;
                    --link: #aaa;
                    --background: #111;
                    --crust: #333;
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
            a {
                color: var(--link)
            }
            code, pre {
                font-family: "Space Mono", monospace, monospace;
            }
        </style>
    </head>
    <body>

        <nav>
            <a href="/">{@html ava}</a>
            <a href="/set">Set avatar</a>
            {#if data.user}
                <a href="/logout">Log out</a>
            {/if}
        </nav>
        
        <slot />
    </body>
</html>