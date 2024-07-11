<script lang="ts">
    export let style: string = "";
    export let avatarUrl: string;
</script>
<style>
    div {
        display: flex;
        gap: 10px;
        align-items: flex-end;
        justify-content: center;
    }
    img {
        object-fit: cover;
    }
</style>
<div>
    {#each [128, 64, 32] as size}
        <img src={avatarUrl} {style} alt="avatar at {size}x{size}" width={size} height={size}>
    {/each}
</div>