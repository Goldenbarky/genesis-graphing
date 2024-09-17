<script lang="ts">
    import CategoryLegend from "./lib/chart/CategoryLegend.svelte";
	import DataEntry from "./lib/DataEntry.svelte";
	import Login from "./lib/Login.svelte";
    import NewScatterPlot from "./lib/NewScatterPlot.svelte";
	import Supabase from "./lib/Supabase.svelte";

    let dirtied = 1;
	let shownPerson = 'bananananana';
	let people: any;
	let colors: any;
</script>

<main>
	<Supabase>
		<div style="display:flex; flex-direction:row; width:100%; height:100%;">
			<div class="tool-panel">
				<Login/>
			</div>
			<div style="width:100%; display:flex; flex-direction:column;">
				<div class="header">
					Teamcenter
				</div>
				<div class="main-window">
					<div class="graph">
                        {#key dirtied}
                            <NewScatterPlot 
								bind:shownPerson={shownPerson}
								bind:people={people}
								bind:colors={colors}
							/>
                        {/key}
					</div>
					<div class="side-window">
						<CategoryLegend
							bind:shownPerson
							legend_data={people}
							legend_color_function={colors}
							space={80}
						/>
						<DataEntry bind:dirtied />
					</div>
				</div>
			</div>
		</div>
	</Supabase>
</main>

<style>
	main {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}
	.main-window {
		display: grid;
		grid-template-rows: 1fr;
		grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
		width: 100%;
		height: 100%;
	}
	.side-window {
		display: grid;
		grid-template-rows: 9fr 1fr;
		grid-template-columns: 1fr;
		width: 100%;
		height: 100%;
		justify-items: center;
	}
	.header {
		font-size: 2rem;
		text-align: left;
	}
	.graph {
		background-color: #004669;
		margin-right: 0.5rem;
	}
	.tool-panel {
		display: flex;
		flex-direction: column-reverse;
		margin-right: 0.5rem;
	}
</style>