<script lang="ts">
    import { getContext, onMount } from "svelte";
    import { csv } from "d3-fetch";
    import { scaleLinear, scaleLog, scaleSqrt, scaleOrdinal } from "d3-scale";
    import { extent } from "d3-array";
    import type { AuthSession, SupabaseClient } from "@supabase/supabase-js";
    import type { Writable } from "svelte/store";
    import CategoryLegend from "./chart/CategoryLegend.svelte";
    import Labels from "./chart/Labels.svelte";
    import Axis from "./chart/Axis.svelte";
    import { randomColor } from "./GenericFunctions";
    import test from "node:test";
    import Quadtree from "./chart/Quadtree.svelte";
    import { curveBasis, line } from "d3";
    import { draw } from "svelte/transition";

    // 1. Getting the data

    let data: Record<string, { line: [number, number], points: { sanity: number, time_stamp: number }[] }>;
    const { supabase, session } = getContext<{
        supabase: SupabaseClient;
        session: Writable<AuthSession | null>;
    }>("supabase");

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
    
    const linspace = (start:number, stop:number, num:number, endpoint = true) => {
        const div = endpoint ? (num - 1) : num;
        const step = (stop - start) / div;
        return Array.from({length: num}, (_, i) => start + step * i);
    }

    const PolyCoefficients = (xVals:number[], coeffs:number[]) => {
        // Returns a polynomial for ``x`` values for the ``coeffs`` provided.
        // The coefficients must be in ascending order (``x**0`` to ``x**o``). 

        let o = coeffs.length;
        console.log(`# This is a polynomial of order ${o}.`);

        let yVals:number[] = [];

        xVals.forEach(x => {
            let y = 0;
            for(let i = 0; i < o; i++) {
                y += coeffs[i] * Math.pow(x, i);
            }
            yVals.push(y);
        })

        console.log(yVals);
        
        return yVals;
    }

    // We will use csv from d3 to fetch the data and we'll sort it by descending gdp
    // download data on: https://datavisualizationwithsvelte.com/data/world_bank.csv
    onMount(() => {
        supabase
            .from("data")
            .select("*")
            .then((imported) => {
                if (!imported.data) return;

                const points = imported.data.reduce((prev, x) => {
                    const date = new Date(x.created_at);
                    const time = date.toTimeString();
                    let b = [];
                    if (prev[x.owner_id]) {
                        b = prev[x.owner_id];
                    }
                    prev[x.owner_id] = [...b, {
                        time_stamp: timestampToHourFraction(time),
                        sanity: x.value,
                    }];
                    return prev;
                }, {});
                // d["columns"] = ["sanity", "time_stamp", "person"];
                
                supabase.from("eod_equations").select("*")
                    .then((imported) => {
                        if (!imported.data) return;

                        const xs = linspace(8, 17, 100);
                        const line = imported.data.reduce((prev, b) => {
                            const ys = PolyCoefficients(xs, b.eq_data.coefs);
                            console.log(b.eq_data.coefs);
                            prev[b.owner_id] = xs.map((x, i) => [x, ys[i]]);
                            return prev;
                        }, {});

                        data = Object.keys(points).reduce((prev, x) => {
                            prev[x] = {
                                line: line[x],
                                points: points[x]
                            };
                            return prev;
                        }, {});
                    });
            });
        
        
        // we have to turn data into the following
        // [
        //  0-inf: {
        //   col1: val
        //  },
        //  columns: [
        //   "col1"
        //  ]
        // ]
        // csv("https://datavisualizationwithsvelte.com/data/world_bank.csv")
        //     .then((unsorted_data) =>
        //         unsorted_data.sort((a, b) => b.gdp - a.gdp),
        //     )
        //     .then((sorted_data) => (data = sorted_data));
    });
    let shownPerson = null;

    // 2. Dimensions, Margins & Scales
    let width;
    const height = 800;
    const margin = { top: 40, right: 20, bottom: 20, left: 35 };
    const xDomain = [8, 17];
    const yDomain = [0, 10];
    const radius = 5;

    let xScale, yScale, radiusScale, colors, people, allPoints;

    // We will be using scale functions from d3 to map our data points
    // within the dimensions of our svg.
    // Set the scale functions when the data is available.
    $: if (data) {
        allPoints = shownPerson ? data[shownPerson].points : Object.keys(data).flatMap(d => data[d].points);
        xScale = scaleLinear()
            .domain(xDomain)
            .range([margin.left, width - margin.right]);

        yScale = scaleLinear()
            .domain(yDomain)
            .range([height - margin.bottom, margin.top]);

        radiusScale = radius;

    }

    $: if (data) {
        people = Object.keys(data);

        colors = scaleOrdinal()
            .range(people.map((_) => colorGen.next().value))
            .domain(people);
    }
    const colorGen = randomColor();

    $: lineGenerator = line()
        .x((d) => xScale(+d[0]))
        .y((d) => yScale(+d[1]));
</script>

<div class="my-grid" bind:clientWidth={width}>
    {#if data && allPoints && width}
    <div style="position:relative;">
            <Quadtree
                data={allPoints}
                {xScale}
                {yScale}
                {width}
                {height}
                {margin}
                let:visible
                let:x
                let:y
                let:found
            >
                <!-- higlight circle -->
                <div
                    class="circle"
                    style="top:{y}px;left:{x.circle}px;display: {visible
                        ? 'block'
                        : 'none'}; width: {radiusScale * 2 +
                        5 +
                        0}px ; height: {radiusScale * 2 +
                        5}px;"
                />
                <!-- Tooltip Element  -->
                <div
                    class="tooltip"
                    style="top:{y + 5}px;left:{x.square +
                        10}px;display: {visible ? 'block' : 'none'};"
                >
                    <h3 style="margin-bottom:1px;color:rgb(17,24,39);">
                        <!-- {found.person} -->
                    </h3>
                    Sanity: {Number(found.sanity)}<br />
                    Time: {Number(+found.time_stamp).toFixed(2)}
                </div>
            </Quadtree>
            <svg {width} {height} style="overflow:visible">
                <g>
                    <Axis
                        {width}
                        {height}
                        {margin}
                        scale={xScale}
                        position="bottom"
                    />
                    <Axis
                        {width}
                        {height}
                        {margin}
                        scale={yScale}
                        position="left"
                    />
                    <Labels
                        labelforx={true}
                        {width}
                        {height}
                        {margin}
                        yoffset={-30}
                        xoffset={-50}
                        label={"Time →"}
                    />
                    <Labels
                        labelfory={true}
                        textanchor={"start"}
                        {width}
                        {height}
                        {margin}
                        yoffset={10}
                        xoffset={10}
                        label={"Sanity ↑"}
                    />
                    {#each Object.keys(data) as person, i}
                        {#if !shownPerson || shownPerson === person}
                            {#each data[person].points as point, j}
                                <circle
                                    cx={xScale(+point.time_stamp)}
                                    cy={yScale(+point.sanity)}
                                    r={radiusScale}
                                    fill={colors(person)}
                                />
                            {/each}
                            <path
                                in:draw={{ duration: 2000 }}
                                shape-rendering="crispEdges"
                                d={lineGenerator(data[person].line)}
                                stroke={colors(person)}
                                stroke-width={1.5}
                                stroke-linecap="round"
                                fill="none" />
                        {/if}
                    {/each}
                </g>
                <g transform="translate({width - margin.right},130)">
                    
                </g>
            </svg>
    </div>
    <CategoryLegend
        bind:shownPerson
        legend_data={people}
        legend_color_function={colors}
        space={80}
    />
    {/if}
</div>

<style>
    b.tooltip {
      text-overflow: nowrap;
    }
    .tooltip {
        pointer-events: none;
        background-color: rgba(249, 250, 251, 0.90);
        color: rgb(17 24 39);
        position: absolute;
        font-family: 'Poppins', sans-serif !important;
        min-width: 8em;
        line-height: 1.2;
        font-size: 0.875rem;
        z-index: 1;
        padding: 6px;
        transition: left 100ms ease, top 100ms ease;
    }
  
    .circle {
      position: absolute;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      width: 10px;
      height: 10px;
      border: 1px solid #fff;
      transition: left 300ms ease, top 300ms ease;
    }
  
    .my-grid {
        display: flex;
        flex-direction: column;
        place-items: center;
    }

    @media (min-width: 1024px) {
        .my-grid {
            flex-direction: row;
        }
    }
</style>
