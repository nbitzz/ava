<script lang="ts">
	import StatusBanner from "$lib/components/StatusBanner.svelte";
    import type { User } from "$lib/types";
    import ReversibleHeading from "$lib/components/ReversibleHeading.svelte"

    export interface Props {
        data: {
            user: User,
            emails: {isPrimary: boolean, email: string, id: string}[]
        };
        form: { success: true, message: string } | { success: false, error: string } | undefined;
    }

    let { data = $bindable(), form }: Props = $props();

    let otherEmails = data.emails.filter(e => !e.isPrimary)
    let primaryEmail = data.emails.find(e => e.isPrimary)
    
</script>

<style>
    form {
        display: flex;
        gap: 10px;
    }
    input[type="email"] {
        flex-basis: 100%;
        min-height: 1em;
    }
    input[type="submit"], form {
        cursor: pointer;
    }
    form input[name="id"] {
        display: none;
    }
    input {
        font-family: "Inter Variable", "Inter", sans-serif;
        padding: 0.5em 1em;
        border-radius: 8px;
        border: 1px solid var(--link);
        color: var(--text);
        background-color: var(--crust);
    }
    div.flex {
        display: flex;
        flex-direction: column;
        gap: .5em;
    }
</style>

<ReversibleHeading to="/set">
    Manage emails
</ReversibleHeading>
{#if form}
    <br>
    <StatusBanner status={form.success ? "success" : "error"}>
        {form.success ? form.message : form.error}
    </StatusBanner>
    <br>
{/if}
{#if primaryEmail}
    <div>
        <hgroup>
            <h2>Your primary email</h2>
            <p>
                This email is provided by your OIDC provider and cannot be changed. Go to your OIDC provider to change it.
            </p>
        </hgroup>
        <form method="post" enctype="multipart/form-data">
            <input type="email" name="email" readonly value={primaryEmail.email}>
        </form>
    </div>
    <br>
    <hr>
    <br>
{/if}
{#if otherEmails.length > 0}
    <div class="flex">
        {#each otherEmails as email}
            <form method="post" enctype="multipart/form-data" action="?/manage">
                <input name="id" readonly value={email.id}>
                <input type="email" name="email" readonly value={email.email}>
                <input type="submit" name="action" value="Delete">
            </form>
        {/each}
    </div>
    <br>
{/if}
<form method="post" enctype="multipart/form-data" action="?/create">
    <input type="email" name="email" placeholder="Email">
    <input type="submit" name="action" value="Add">
</form>
<br>
<hr>
<br>
These emails redirect to your avatar in apps that use the libravatar API. Use this page to add any email aliases you may have.
