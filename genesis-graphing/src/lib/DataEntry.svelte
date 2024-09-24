<script lang="ts">
    import { getContext, onMount } from "svelte";
    import type { AuthSession, SupabaseClient } from "@supabase/supabase-js";
    import type { Writable } from "svelte/store";
    import Login from "./Login.svelte";
    import { drag } from "d3-drag";

    export let dirtied: number;

    let sanity = 5;
    let insane:boolean|null = null;

    const { supabase, session } = getContext<{
        supabase: SupabaseClient;
        session: Writable<AuthSession | null>;
    }>("supabase");

    const isUserAuthorized = async (id:string) => {
        const { data: data } = await supabase.from("users").select("*").eq("id", id).single();
        insane = data?.insane;
        return (data !== null || data !== undefined);
    }
</script>
<div class="container">
    {#if !$session || !$session.user}
    <div class="column">
        You must be logged in to save values to the database, log in with Google now:
        <div style="border: 2px solid">
            <Login --text-size=1.5rem/>
        </div>
    </div>
        
    {:else}
        {#await isUserAuthorized($session.user.id)}
            Fetching...
        {:then authorized} 
            {#if authorized}
                {#if insane !== null && insane }
                    <div class="slidecontainer">
                        <div class="number-labels" style="margin-left: -0.2rem;">
                            {#each Array(16) as _, i}
                                <div style="width:1rem;">
                                    {i - 5}
                                </div>
                            {/each}
                        </div>
                        <input type="range" min="{-5}" max="10" bind:value={sanity} class="slider" id="myRange">
                        <div class="slider-range">
                            {#each Array(16) as _}
                                <div class="slider-tick"/>
                            {/each}
                        </div>
                        <button class="button" on:click={async () => {
                            await supabase.from("data").insert({
                                owner_id: $session.user.id,
                                value: sanity
                            });
                            dirtied += 1;
                        }}>Log Sanity</button>
                    </div>
                {:else}
                    <div class="slidecontainer">
                        <div class="number-labels" style="margin-left: 0.2rem;">
                            {#each Array(11) as _, i}
                                <div>
                                    {i}
                                </div>
                            {/each}
                        </div>
                        <input type="range" min="0" max="10" bind:value={sanity} class="slider" id="myRange">
                        <div class="slider-range">
                            {#each Array(16) as _}
                                <div class="slider-tick"/>
                            {/each}
                        </div>
                        <button class="button" on:click={async () => {
                            await supabase.from("data").insert({
                                owner_id: $session.user.id,
                                value: sanity
                            });
                            dirtied += 1;
                        }}>Log Sanity</button>
                    </div>
                {/if}
            {:else}
                You are not currently authorized, simply spam Justin with requests to fix that
            {/if}
        {/await}
    {/if}
</div>

<style>
    .container {
        background-color: #464646;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
    }
    .number-labels {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 89%;
    }
    .button {
        color: white;
        background-color: #5A5A5A;
    }
    .column {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
    .slidecontainer {
        width: 100%; /* Width of the outside container */
        height: 80%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        position: relative;
    }
    .slider-range {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 87%;
        height: 0.2rem;
        top: 50%;
        background-color: #04AA6D;
        position: absolute;
    }
    .slider-tick {
        width: 6px;
        height: 25px;
        background-color: #04AA6D;
    }

    /* The slider itself */
    .slider {
        -webkit-appearance: none;  /* Override default CSS styles */
        appearance: none;
        width: 90%; /* Full-width */
        height: 25px; /* Specified height */
        background-color: #04AA6D;
        background: transparent; /* Grey background */
        outline: none; /* Remove outline */
        /* opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
        border-radius: 0.5rem;
        -webkit-transition: .2s; /* 0.2 seconds transition on hover */
        z-index: 1;
    }

    /* Mouse-over effects */
    .slider::-webkit-slider-thumb:hover {
        background: #06cc83;
    }

    /* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
    .slider::-webkit-slider-thumb {
        -webkit-appearance: none; /* Override default look */
        appearance: none;
        width: 25px; /* Set a specific slider handle width */
        height: 25px; /* Slider handle height */
        background: #04AA6D; /* Green background */
        cursor: pointer; /* Cursor on hover */
        border-radius: 1rem;
        transition: background-color .2s;
    }
    .slider::-moz-range-thumb {
        width: 25px; /* Set a specific slider handle width */
        height: 25px; /* Slider handle height */
        background: #04AA6D; /* Green background */
        cursor: pointer; /* Cursor on hover */
    }
</style>