<script lang="ts">
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { AuthSession, SupabaseClient } from "@supabase/supabase-js";

    export let legend_data, legend_color_function, shownPerson;

    let people:{'id':string, 'display_name':string}[] = []

    const { supabase, session } = getContext<{
        supabase: SupabaseClient;
        session: Writable<AuthSession | null>;
    }>("supabase");

    onMount(async () => {
      const { data } = await supabase.from("users").select("*");
      people = data;
    })
  </script>
  <div>
    {#each legend_data as d, i}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click={() => {
        if (!shownPerson || shownPerson !== d) {
            shownPerson = d;
        } else {
            shownPerson = null;
        }
    }}>
    <div
      style={`width:20px;height:20px;background-color:${legend_color_function(d)}`}></div>
      {people.find(x => x.id === d)?.display_name}
    </div>
  {/each}
  </div>
  