<script lang="ts">
	import { getContext, onMount } from "svelte";
	import type { Writable } from "svelte/store";
	import type { AuthSession, SupabaseClient } from "@supabase/supabase-js";

	export let legend_data, shownPerson;
	export let colors = new Map();

	export let people: { id: string; display_name: string }[] = [];
	let equation_data: {owner_id: string, eq_data:{equation:string}}[] = [];

	const { supabase, session } = getContext<{
		supabase: SupabaseClient;
		session: Writable<AuthSession | null>;
	}>("supabase");

	onMount(async () => {
		const { data:data1 } = await supabase.from("users").select("*");
		people = data1;

		const { data:data2 } = await supabase.from("eod_equations").select("*");
		equation_data = data2;
	});
</script>

<div class="legend">
	{#if legend_data}
		{#key colors}
			{#each legend_data as d, i}
				{@const equation = equation_data.find(x => x.owner_id === d)?.eq_data.equation}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="legend-entry" 
					on:click={() => {
						if (!shownPerson || shownPerson !== d) {
							shownPerson = d;
						} else {
							shownPerson = null;
						}
					}}
				>
					<div class="color-block" style={`background-color:${colors.get(d)}`}>
						<div class="name">
							{people.find((x) => x.id === d)?.display_name}
						</div>
						{#if equation}
							<div class="equation">
								{equation}
							</div>
						{/if}
					</div>
				</div>
				{#if i < legend_data.length - 1}
					<div class="legend-divider"/>
				{/if}
			{/each}
		{/key}
	{/if}
</div>

<style>
	.legend{
		display: flex;
		flex-direction: column;
		background-color: #787878;
		width: 100%;
		box-sizing: border-box;
		margin-bottom: 1rem;
		padding: 1rem;
		max-height: 83vh;
		overflow-y: auto;
	}
	.legend-entry{
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}
	.legend-divider {
		max-height: 5rem;
		min-height: 0.5rem;
	}
	.name {
		color: black;
		text-align: center;
	}
	.color-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}
	.equation{
		color: black;
	}
</style>
