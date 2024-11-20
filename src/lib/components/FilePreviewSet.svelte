<script lang="ts">
    export interface Props {
        style?: string;
        avatarUrl: string;
    }

    let { style = "", avatarUrl }: Props = $props();
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