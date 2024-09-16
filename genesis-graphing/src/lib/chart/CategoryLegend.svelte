<script>
    export let legend_data, legend_color_function, shownPerson;
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
      {d[0] + d.slice(1).toLowerCase()}
    </div>
  {/each}
  </div>
  