<script lang="ts">
	import DataEntry from "./lib/DataEntry.svelte";
    import LinePlot from "./lib/LinePlot.svelte";
	import Login from "./lib/Login.svelte";
    import NewScatterPlot from "./lib/NewScatterPlot.svelte";
    import ScatterPlot from "./lib/ScatterPlot.svelte";
	import Supabase from "./lib/Supabase.svelte";

    let dirtied = 1;
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
                            <NewScatterPlot />
                        {/key}
					</div>
					<div class="side-window">
						<div>
							
						</div>
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