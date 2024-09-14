<script lang="ts">
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import { signInWithGoogle } from "./Supabase.svelte";
    import type { AuthSession, SupabaseClient } from "@supabase/supabase-js";

    const { supabase, session } = getContext<{
        supabase: SupabaseClient;
        session: Writable<AuthSession | null>;
    }>("supabase");
</script>

<div class="custom-column" style="flex: none;">
    {#if !$session || !$session.user}
        <button class="custom-button" on:click={signInWithGoogle}>
            Log in
        </button>
    {:else}
        <!-- svelte-ignore a11y-missing-attribute -->
        <img src={$session.user.user_metadata.avatar_url} class="profile-pic" />
    {/if}
</div>

<style>
    .custom-column {
        padding-top: 0;
        padding-bottom: 0;
    }
    .custom-button {
        padding-bottom: 2px;
        background-color: var(--background);
        color: var(--text);
        margin-bottom: 0.2rem;
        border: 0px;
        user-select: none;
        color: var(--text);
        font-size: small;
        cursor: pointer;
    }
    .profile-pic {
        width: 5rem;
        border-radius: 999px;
        border: 2px solid var(--text);
        user-select: none;
    }
</style>
