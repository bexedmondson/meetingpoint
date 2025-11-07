<script>
    import { buildMap, findMeetingPoint } from './findMeetingPoint.js'
    import MeetingPath from "./MeetingPath.svelte";

    let meetingPointInfo = $state(null)

    function onclick() {
        meetingPointInfo = findMeetingPoint(starts, ends)
    }

    const averageDuration = $derived.by(() => {
        let text = meetingPointInfo.average.toString();
        let pointIndex = text.indexOf(".")
        if (pointIndex > 0) {
            console.log(meetingPointInfo.average);
            text = text.substring(0, pointIndex + 2);
            console.log(text);
        }

        return text;
    });
    
    let { starts, ends } = $props();
</script>

{#await buildMap()}
    <p>Loading...</p>
{:then map}
    <button onclick={onclick}><b>  Find  </b></button>

    <div class="results">
    {#if meetingPointInfo !== null}
        {#if meetingPointInfo === undefined || meetingPointInfo.end === undefined}
            <h2 class="summary">No path found :(</h2>
        {:else}
            <h3 class="summary">Best option: {meetingPointInfo.end}</h3>
            <h3 class="summary">Average time: {averageDuration} minutes</h3>

            <div class="paths">
            {#each meetingPointInfo.paths as path}
                <MeetingPath meetingPathInfo={path} />
            {/each}
            </div>

        {/if}
    {/if}
    </div>
{/await}

<style>
    .results {
        align-items: center;
    }

    .summary {
        text-align: center;
    }

    .paths {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 2em;

    }

    button {
        min-height: 3em;
        min-width: 5em;
        padding: 0;
    }
</style>