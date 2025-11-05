<script>
    import PathFromTo from "./PathFromTo.svelte";
    import { getStationFromId } from './findMeetingPoint.js';
    import london from '../tubemaps/datasets/london.json';
    import LineIndicator from "./LineIndicator.svelte";

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
        <div class="segment">
        {#if pathSegment.type === "station" && i === 0}
            {getStationFromId(pathSegment.station)}
        {:else if pathSegment.isFirstTravel}
            <LineIndicator line={pathSegment.line} />
        {:else if pathSegment.isLineChanging}
            {getStationFromId(pathSegment.station)}
            <!--LineIndicator line={pathSegment.prevLine} /-->
            <LineIndicator line={pathSegment.line} />
        {/if}
        </div>
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
    }

    .segment {
        text-align: center;
    }
</style>