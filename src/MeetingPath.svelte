<script>
    import PathFromTo from "./PathFromTo.svelte";
    import PathSeparator from "./PathSeparator.svelte";
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
        {#if !pathSegment.isFirstTravel && !pathSegment.isLineChanging && !(pathSegment.type === "station" && (i === 0 || i === pathStructure.length - 1)) }
        {:else}
            {#if pathSegment.isFirstTravel}
                <div class="pathStep">
                    <LineIndicator line={pathSegment.line} />
                </div>
            {:else if pathSegment.isLineChanging}
                <div class="pathStep pathStation">
                    {getStationFromId(pathSegment.station)}
                </div>
                <PathSeparator />
                <div class="pathStep">
                    <!--LineIndicator line={pathSegment.prevLine} /-->
                    <LineIndicator line={pathSegment.line} />
                </div>
            {:else}
                <div class="pathStep pathStation">
                    {getStationFromId(pathSegment.station)}
                </div>
            {/if}

            {#if i !== pathStructure.length - 1}
                <PathSeparator />
            {/if}
        {/if}
    {/each}
{/if}
</div>

<style>
    .singlePath {
        flex-basis: 20%;
        flex-grow: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border-style: solid;
        border-color: #eee;
        border-width: 4px;
        border-radius: 0.5em;
        background-color: #333;
        padding-top: 1em;
        padding-left: 1em;
        padding-right: 1em;
    }

    .pathStep {
        align-self: stretch;
        text-align: center;
        padding: 1em;
        margin-bottom: 1em;
    }

    .pathStation {
        margin-top: 1em;
        border-style: solid;
        border-color: #eeeeee;
        border-width: 4px;
        border-radius: 0.5em;
    }

</style>