<script lang="ts">
	import type { User } from "$lib/types";

    export let data: {user: User};
</script>

<h1>Hi, {data.user.name}</h1>
<p>
    Your identifier is {data.user.sub}.
</p>