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
	
	function colorIsDarkAdvanced(bgColor) {
		let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
		let r = parseInt(color.substring(0, 2), 16); // hexToR
		let g = parseInt(color.substring(2, 4), 16); // hexToG
		let b = parseInt(color.substring(4, 6), 16); // hexToB
		let uicolors = [r / 255, g / 255, b / 255];
		let c = uicolors.map((col) => {
			if (col <= 0.03928) {
			return col / 12.92;
			}
			return Math.pow((col + 0.055) / 1.055, 2.4);
		});
		let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
		return L <= 0.179;
	}
</script>

<div class="legend">
	{#if legend_data}
		{#key colors}
			{#each legend_data as d, i}
				{@const equation = equation_data.find(x => x.owner_id === d)?.eq_data.equation}
				{@const color = colors.get(d)}
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
					<div class="color-block" style={`background-color:${color}`}>
						<div class="name" style="color: {colorIsDarkAdvanced(color) ? '#FFFFFF' : '#000000'};">
							{people.find((x) => x.id === d)?.display_name}
						</div>
						{#if equation}
							<div class="equation" style="color: {colorIsDarkAdvanced(color) ? '#FFFFFF' : '#000000'};">
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
		padding: 0.5rem;
		box-sizing: border-box;
	}
	.equation{
		color: black;
	}
</style>
