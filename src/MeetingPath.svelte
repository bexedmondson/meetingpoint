<script>
    import PathFromTo from "./PathFromTo.svelte";
    import { getStationFromId } from './findMeetingPoint.js';
    import london from '../tubemaps/datasets/london.json';
    import LineIndicator from "./LineIndicator.svelte";
    import { ChevronsDown } from "@lucide/svelte";

    let { meetingPathInfo } = $props();

    const pathStructure = $derived.by(() => {
        let pathStructure = [];
        for (let i = 0; i < meetingPathInfo.finalPath.length; i++) {
            let currentStation = meetingPathInfo.finalPath[i];

            pathStructure.push({
                type: "station",
                station: currentStation
            });

            if (i === meetingPathInfo.finalPath.length - 1)
                continue;

            let transitionInfo = {
                type: "travel",
                isLineChanging: false,
                isFirstTravel: false
            };

            let nextStop = meetingPathInfo.finalPath[i + 1];

            //need to put this info in the path rather than calculating it here
            // otherwise we might end up switching between h&c and circle several times for no reason, for example
            const nextStopChange = london.connections.find(connection =>
                (connection.source === currentStation && connection.target === nextStop)
                || (connection.source === nextStop && connection.target === currentStation && connection.one_way === "0")
            )

            transitionInfo.line = nextStopChange.line;

            const prevStopChange = pathStructure.findLast(connection => connection.type === "travel");

            if (prevStopChange !== undefined) {
                transitionInfo.station = currentStation;
                transitionInfo.isLineChanging = nextStopChange.line !== prevStopChange.line;
                transitionInfo.prevLine = prevStopChange.line;
            } else {
                transitionInfo.isFirstTravel = true;
            }

            pathStructure.push(transitionInfo);
        }
        return pathStructure;
    });

</script>

<div class="singlePath">
{#if meetingPathInfo === undefined || meetingPathInfo.finalPath === undefined}
    <p>No path found <PathFromTo path={meetingPathInfo.finalPath} /> :(</p>
{:else}
    <p>Path <PathFromTo path={meetingPathInfo.finalPath} />, duration {meetingPathInfo.cost}</p>

    {#each pathStructure as pathSegment, i}
        {#if !pathSegment.isFirstTravel && !pathSegment.isLineChanging && !(pathSegment.type === "station" && (i === 0 || i === pathStructure.length - 1)) }
        {:else}
            {#if pathSegment.isFirstTravel}
                <div class="pathStep">
                    <LineIndicator line={pathSegment.line} />
                </div>
            {:else if pathSegment.isLineChanging}
                <div class="pathStep">
                    {getStationFromId(pathSegment.station)}
                    <!--LineIndicator line={pathSegment.prevLine} /-->
                    <LineIndicator line={pathSegment.line} />
                </div>
            {:else}
                <div class="pathStep stationOnly">
                    {getStationFromId(pathSegment.station)}
                </div>
            {/if}

            {#if i !== pathStructure.length - 1}
                <div style="position: relative">
                    <svg class="pathSeparator" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke="#111" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="m7 6 5 5 5-5"/><path d="m7 13 5 5 5-5"/></svg>
                    <svg class="pathSeparator" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke="#eee" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m7 6 5 5 5-5"/><path d="m7 13 5 5 5-5"/></svg>
                    <!--ChevronsDown class="pathSeparator" strokeWidth="8" color="#111" />
                    <ChevronsDown class="pathSeparator" strokeWidth="4" /-->
                </div>
            {/if}
        {/if}
    {/each}
{/if}
</div>

<style>
    .singlePath {
        flex-basis: 0;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .pathStep {
        width: 100%;
        text-align: center;
        border-style: solid;
        border-color: #eeeeee;
        border-width: 4px;
        border-radius: 0.5em;
        margin: 1em;
        padding: 1em;
    }

    .pathSeparator {
        position: absolute;
        transform: translate(-50%, -95%);
        width: 36px;
        height: 36px;
    }

</style>