<script lang="ts">
    import "@fontsource-variable/inter";
    export let data: { user?: { sub: string, username: string } };
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
                --background: white;
            }
            body {
                font-family: "Inter Variable", "Inter", sans-serif;
                max-width: 35em;
                margin: auto;
                color: var(--text);
            }
            nav {
                display: flex;
                gap: 1em;
                justify-content: center;
                margin: 1em 0;
            }
        </style>
    </head>
    <body>

        <nav>
            <a href="/">Home</a>
            <a href="/set">Set avatar</a>
            {#if data.user}
                <a href="/logout">Log out</a>
            {/if}
        </nav>
        
        <slot />
    </body>
</html>