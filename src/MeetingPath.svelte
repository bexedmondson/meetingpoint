<script>
    import PathFromTo from "./PathFromTo.svelte";
    import { getStationFromId } from './findMeetingPoint.js';
    import london from '../tubemaps/datasets/london.json';
    import LineIndicator from "./LineIndicator.svelte";

    export let meetingPathInfo;

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
            transitionInfo.isLineChanging = nextStopChange.line !== prevStopChange.line;
            transitionInfo.prevLine = prevStopChange.line;
        }
        else{
            transitionInfo.isFirstTravel = true;
        }
        
        pathStructure.push(transitionInfo);
    }

</script>

{#if meetingPathInfo === undefined || meetingPathInfo.finalPath === undefined}
    <p>No path found <PathFromTo path={meetingPathInfo.finalPath} /> :(</p>
{:else}
    <p>Path <PathFromTo path={meetingPathInfo.finalPath} />, duration {meetingPathInfo.cost}</p>

    {#each pathStructure as pathSegment}
        {#if pathSegment.type === "station"}
            {getStationFromId(pathSegment.station)}
        {:else if pathSegment.isFirstTravel}
            <LineIndicator line={pathSegment.line} />
        {:else if pathSegment.isLineChanging}
            <LineIndicator line={pathSegment.prevLine} />
            <LineIndicator line={pathSegment.line} />
        {/if}
    {/each}
{/if}

<style>
</style>