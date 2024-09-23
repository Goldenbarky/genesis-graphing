<script lang="ts">
    import { getContext, onMount } from "svelte";
    import paintIcon from "../assets/palette.png"
    import ColorPicker from "svelte-awesome-color-picker";
    import type { AuthSession, SupabaseClient } from "@supabase/supabase-js";
    import type { Writable } from "svelte/store";
    import { randomColor } from "./GenericFunctions";

    let popup = false
    export let colors = new Map();
    export let dirtied

    let names;
    let color;

    const colorGen = randomColor();

    const { supabase, session } = getContext<{
        supabase: SupabaseClient;
        session: Writable<AuthSession | null>;
    }>("supabase");

    onMount(async () => {
      	const { data:data } = await supabase.from("users").select("*");
		names = data;

        const perp = names?.find(x => x.id === $session?.user.id && !x.color);
        if (perp) {
            names = [...names.filter(x => x.id !== perp.id), await supabase.from('users').update({ ...perp, color: colorGen.next().value }).eq('id', perp.id).select('*')];
        }

        names.forEach(x => colors.set(x.id, x.color));
        color = colors.get($session?.user.id);
    });
</script>

<div class="button">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
    <img class="icon" color="white" src={paintIcon} alt="paint" on:click={() => popup = !popup}>
    <div class="popup" style="visibility:{popup ? 'visible': 'hidden'}">
        <ColorPicker
            position="responsive"
            --cp-text-color="white"
            bind:hex={color}
            on:input={(event) => {
                colors.set($session?.user.id, event.detail.hex);
                dirtied += 1
            }}
        />
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div class="save" on:click={async () => {
            let data = {id: $session?.user.id, color: color}
            let response = await supabase.from('users').update({color: color}).eq('id', $session?.user.id);
        }}>
            Save
        </div>
    </div>
</div>

<style>
    .button {
        display: flex;
        position: relative;
    }
    .icon {
        width: 50px;
    }
    .popup {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: absolute;
        border: black 1px solid;
        border-radius: 0.2rem;
        left: 65px;
        padding: 0.5rem;
        background-color: #787878;
    }
    .save {
        cursor: pointer;
        border: black 1px solid;
        border-radius: 0.2rem;
        margin-top: 1rem;
        width: fit-content;
        padding: 0.2rem;
    }
</style>