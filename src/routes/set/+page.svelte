<script lang="ts">
    export let data: { user: { sub: string, username: string } };
</script>

<h1>Hi, {data.user.username}</h1>
<p>
    Your identifier is {data.user.sub}.
</p>