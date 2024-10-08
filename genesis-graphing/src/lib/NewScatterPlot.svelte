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

    let data: Record<string, { line: [number, number], points: { sanity: number, time_stamp: number }[], order: number }>;
    let names;
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
        let yVals:number[] = [];

        xVals.forEach(x => {
            let y = 0;
            for(let i = 0; i < o; i++) {
                y += coeffs[i] * Math.pow(x, i);
            }
            yVals.push(y);
        })

        return yVals;
    }

    const refreshData = async () => {
        let imported = await supabase
            .from("data")
            .select("*");
        if (!imported.data) return;

        const points = imported.data.reduce((prev, x) => {
            const date = new Date(x.created_at);
            let b = [];
            if (prev[x.owner_id]) {
                b = prev[x.owner_id];
            }
            prev[x.owner_id] = [...b, {
                person_id: x.owner_id,
                time_stamp: date,
                sanity: x.value,
            }];
            return prev;
        }, {});

        imported = await supabase.from("eod_equations").select("*");
        if (!imported.data) return;

        const line = imported.data.reduce((prev, { eq_data, owner_id }) => {
            // const ys = PolyCoefficients(xs, eq_data.coefs);
            prev[owner_id] = eq_data.points;
            return prev;
        }, {});

        data = Object.keys(points).reduce((prev, x) => {
            prev[x] = {
                line: line[x],
                points: points[x],
            };
            return prev;
        }, {});
    };

    // We will use csv from d3 to fetch the data and we'll sort it by descending gdp
    // download data on: https://datavisualizationwithsvelte.com/data/world_bank.csv
    onMount(async () => {
        await refreshData();

      	const { data:data } = await supabase.from("users").select("*");
		names = data;

        const perp = names?.find(x => x.id === $session?.user.id && !x.color);
        if (perp) {
            names = [...names.filter(x => x.id !== perp.id), await supabase.from('users').update({ ...perp, color: colorGen.next().value }).eq('id', perp.id).select('*')];
        }

    });
    export let shownPerson = 'banana';

    // 2. Dimensions, Margins & Scales
    let width;
    const height = 1000;
    const margin = { top: 40, right: 20, bottom: 20, left: 35 };
    const xDomain = [8, 17];
    const yDomain = [-5, 10];
    const radius = 5;

    let xScale, yScale, radiusScale, allPoints;
    export let colors = new Map<string, string>(), people;

    // We will be using scale functions from d3 to map our data points
    // within the dimensions of our svg.
    // Set the scale functions when the data is available.
    $: if (data) {
        allPoints = shownPerson && shownPerson !== 'bananananana' ? data[shownPerson].points : Object.keys(data).flatMap(d => data[d].points);
        xScale = scaleLinear()
            .domain(xDomain)
            .range([margin.left, width - margin.right]);

        yScale = scaleLinear()
            .domain(yDomain)
            .range([height - margin.bottom, margin.top]);

        radiusScale = radius;

    }

    const colorGen = randomColor();

    $: lineGenerator = line()
        .x((d) => xScale(+d[0]))
        .y((d) => yScale(+d[1]));

    let done = false;
    $: if (data && !done && names) {
        shownPerson = null;
        done = true;

        people = Object.keys(data);
    }
</script>

<div class="my-grid" bind:clientWidth={width}>
    {#if data && allPoints && width && names}
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
                    <div style="margin-bottom:1px; font-size: 1rem;">
                        {names.find(x => x.id === found.person_id).display_name}
                    </div>
                    Sanity: {Number(+found.sanity)}<br />
                    Time: {found.time_stamp.toLocaleTimeString()}
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
                        tick_number={11}
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
                    <path
                        in:draw={{ duration: 2000 }}
                        shape-rendering="crispEdges"
                        d={lineGenerator([[8, 0], [17, 0]])}
                        stroke="#ffffff"
                        stroke-width={0.5}
                        stroke-linecap="round"
                        fill="none" />
                    {#each Object.keys(data) as person, i (person)}
                        {#if !shownPerson || shownPerson === person}
                            {#each data[person].points as point, j}
                                <circle
                                    cx={xScale(timestampToHourFraction(point.time_stamp.toTimeString()))}
                                    cy={yScale(+point.sanity)}
                                    r={radiusScale}
                                    fill={colors.get(person)}
                                />
                            {/each}
                        {/if}
                        
                        {#if (!shownPerson || shownPerson === person) && data[person].line}
                            <path
                                in:draw={{ duration: 2000 }}
                                shape-rendering="crispEdges"
                                d={lineGenerator(data[person].line)}
                                stroke={colors.get(person)}
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
