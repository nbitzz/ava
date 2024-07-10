<script lang="ts">
	import type { User } from "$lib/types";

    export let data: {user: User};
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
</style>

<h1>Hi, {data.user.name}</h1>
<p>
    The <code>sub</code> claim is set to <code>{data.user.sub}</code>.
    Your identifier is <code>{data.user.identifier}</code>.
</p>
<form method="post" enctype="multipart/form-data">
    <label for="newAvatar">Set a new avatar:</label>
    <input type="file" accept="image/*" name="newAvatar">
    <input type="submit" value="Upload">
</form>