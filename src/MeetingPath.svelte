<script>
    import PathFromTo from "./PathFromTo.svelte";
    import PathSeparator from "./PathSeparator.svelte";
    import { getStationFromId } from './findMeetingPoint.js';
    import LineIndicator from "./LineIndicator.svelte";
    import connections from '../tubemaps/datasets/connections.json';

    let { meetingPathInfo } = $props();

    const duration = $derived.by(() => {
        let text = meetingPathInfo.cost.toString();
        let pointIndex = text.indexOf(".")
        if (pointIndex > 0) {
            console.log(meetingPathInfo.cost);
            text = text.substring(0, pointIndex + 2);
            console.log(text);
        }

        return text;
    });

    const pathStructure = $derived.by(() => {
        let pathStructure = [];
        for (let i = 0; i < meetingPathInfo.finalPath.length; i++) {

            //console.log("final path: ")
            //console.log(finalPath)

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
            const nextStopChange = connections.find(connection =>
                (connection.source_suffix === currentStation && connection.target_suffix === nextStop)
                || (connection.source_suffix === nextStop && connection.target_suffix === currentStation && connection.one_way === "0")
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

        console.log("path structure")
        console.log(pathStructure)
        return pathStructure;
    });

</script>

<div class="singlePath">
{#if meetingPathInfo === undefined || meetingPathInfo.finalPath === undefined}
    <p>No path found <PathFromTo path={meetingPathInfo.finalPath} /> :(</p>
{:else}
    <p><b>Route <PathFromTo path={meetingPathInfo.finalPath} /></b><br>{duration} minutes</p>

    {#each pathStructure as pathSegment, i}
        {#if !pathSegment.isFirstTravel && !pathSegment.isLineChanging && !(pathSegment.type === "station" && (i === 0 || i === pathStructure.length - 1)) }
        {:else}
            {#if pathSegment.isFirstTravel}
                <div class="pathStep">
                    <LineIndicator line={pathSegment.line} isEnter={true}/>
                </div>
            {:else if pathSegment.isLineChanging}
                <div class="pathStep pathStation">
                    {getStationFromId(pathSegment.station)}
                </div>
                <PathSeparator />
                <div class="pathStep">
                    <LineIndicator line={pathSegment.line} isEnter={false}/>
                </div>
            {:else}
                <div class="pathStep pathStation">
                    {getStationFromId(pathSegment.station)}
                </div>

                {#if i !== pathStructure.length - 1}
                    <PathSeparator />
                {/if}
            {/if}
        {/if}
    {/each}
{/if}
</div>

<style>
    .singlePath {
        flex-basis: 20%;
        flex-grow: 0;
        flex-shrink: 0;
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
    }

    .pathStation {
        margin-bottom: 1em;
        border-style: solid;
        border-color: #eeeeee;
        border-width: 4px;
        border-radius: 0.5em;
    }

</style>