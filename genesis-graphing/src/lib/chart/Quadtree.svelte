<!-- Quadtree.svelte -->
<script lang="ts">
    import { quadtree } from 'd3-quadtree';
    export let xScale, yScale, width, height;
  
    let visible = false;
    let found = {};
    let e = {};
  
    export let margin;
    export let data;
    export let searchRadius = undefined;
  
    function findItem(evt) {
      const xLayerKey = 'layerX';
      const yLayerKey = 'layerY';
  
      found = finder.find(evt[xLayerKey], evt[yLayerKey], searchRadius) || {};
      visible = Object.keys(found).length > 0;
    }
  
    let finder;

    const regex = /([0-9]{2}):([0-9]{2}):([0-9]{2})/;
    const timestampToHourFraction = (time: string) => {
        let match = regex.exec(time);
        if (!match) return -1;

        let time_value = parseInt(match[1]);
        time_value += parseInt(match[2]) / 60;
        time_value += parseInt(match[3]) / 6000;

        time_value = Math.round(time_value * 100) / 100;

        return time_value;
    };
  
    $: if (data) {
      finder = quadtree()
        .x(function (d) {
          return xScale(timestampToHourFraction(d.time_stamp.toTimeString()));
        })
        .y(function (d) {
          return yScale(+d.sanity);
        })
        .addAll(data);
    }
  
    const getPosition = (found) => {
      if (found && found.sanity && found.time_stamp) {
        const xPos = xScale(timestampToHourFraction(found.time_stamp.toTimeString()));
        if (xPos > 0.9 * xScale.range()[1]) {
          return { circle: xPos, square: xPos - 100 };
        } else {
          return { circle: xPos, square: xPos };
        }
      }
    };
</script>

<div
	aria-hidden
	class="bg"
	on:mousemove={findItem}
	on:blur={() => (visible = false)}
	on:mouseout={() => (visible = false)}
/>
{#if found.sanity && found.time_stamp}
	<slot
		x={getPosition(found)}
		y={yScale(+found.sanity)}
		{found}
		{visible}
		{margin}
		{e}
	/>
{/if}

<style>
	.bg {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}
</style>



