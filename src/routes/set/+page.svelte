<script lang="ts">
	import type { User } from "$lib/types";

    export let data: {user: User, url: string};
</script>

<style>
    form {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    form > * {
        font-family: "Inter Variable", "Inter", sans-serif;
    }
    form > input[type="file"] {
        width: 100%;
    }
    form > input[type="submit"], form > input[type="file"] {
        padding: 0.5em 1em;
        cursor: pointer;
        border-radius: 8px;
        border: 1px solid var(--link);
        color: var(--text);
        background-color: var(--crust);
    }
    form > input[type="file"]::file-selector-button {
        display: none;
    }
    form > label {
        flex-shrink: 0;
    }
    summary::marker {
        content: ""
    }
    summary {
        color: var(--link);
        cursor:pointer;
    }
    details > div {
        border-left: 0.25em solid var(--link);
        padding-left: 1em;
        overflow-x: auto;
        background-color: var(--crust);
        width: 100%;
    }
</style>

<h1>Hi, {data.user.name}</h1>
<p>
    <details>
        <summary>View user information...</summary>
        <div>
            <pre>{JSON.stringify(data.user, null, 4)}</pre>
        </div>
    </details>
    <details>
        <summary>Avatar URLs...</summary>
        <div>
            <ul>
                {#each ["", "32", "64", "128", "256", "512"] as variant}
                    <li>{new URL(`/avatar/${data.user.identifier}/${variant}`, data.url)}</li>
                {/each}
            </ul>
        </div>
    </details>
</p>
<form method="post" enctype="multipart/form-data">
    <label for="newAvatar">Set a new avatar:</label>
    <input type="file" accept="image/*" name="newAvatar">
    <input type="submit" value="Upload">
</form>