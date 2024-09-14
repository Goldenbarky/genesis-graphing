<script lang="ts">
	import Login from "./lib/Login.svelte";
    import ScatterPlot from "./lib/ScatterPlot.svelte";
	import Supabase from "./lib/Supabase.svelte";
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
						<ScatterPlot/>
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
		grid-template-columns: 7fr 3fr;
		width: 100%;
		height: 100%;
	}
	.header {
		font-size: 2rem;
		text-align: left;
	}
	.graph {
		background-color: #004669;
	}
	.tool-panel {
		display: flex;
		flex-direction: column-reverse;
		margin-right: 0.5rem;
	}
</style>