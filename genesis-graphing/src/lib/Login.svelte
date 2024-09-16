<script lang="ts">
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import { signInWithGoogle } from "./Supabase.svelte";
    import type { AuthSession, SupabaseClient } from "@supabase/supabase-js";

    const { supabase, session } = getContext<{
        supabase: SupabaseClient;
        session: Writable<AuthSession | null>;
    }>("supabase");

    let themeModalEnabled = false;
    let theme = "#00668A"
</script>

<div class="custom-column" style="flex: none;">
    {#if !$session || !$session.user}
        <button class="custom-button" on:click={signInWithGoogle}>
            Log in
        </button>
    {:else}
        <!-- svelte-ignore a11y-missing-attribute -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <img src={$session.user.user_metadata.avatar_url} class="profile-pic" on:click={() => {
            themeModalEnabled = true;
        }}/>
    {/if}
</div>
<!-- <div class="modal {themeModalEnabled ? 'is-active' : ''}">
     svelte-ignore a11y-missing-attribute a11y-no-static-element-interactions a11y-click-events-have-key-events
    <div
        class="modal-background"
        on:click={() => {
            themeModalEnabled = false;
        }}
    />
    <div class="modal-content" style="display: grid; align-items: center; justify-items: center; overflow: visible;">
        <div class="custom-box">
            <ColorPicker bind:hex={theme} label={theme}/>
        </div>
    </div>
</div>  -->

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
        font-size: var(--text-size);
    }
    .profile-pic {
        width: 3rem;
        border-radius: 999px;
        border: 2px solid var(--text);
        user-select: none;
    }
    .modal-background {
        width: 100%;
        height: 100%;
    }

    .modal-content, .modal-card {
        margin: 0 20px;
        max-height: calc(100vh - 160px);
        overflow: auto;
        position: relative;
        width: 100%;
    }
    .modal {
        align-items: center;
        display: none;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        position: fixed;
        z-index: 40;
        width: 100vw;
        height: 100vh;
    }
    .modal.is-active {
        display: flex;
    }
    .modal-content,
    .modal-card {
        margin: 0 auto;
        max-height: calc(100vh - 40px);
        width: 640px;
    }
</style>
