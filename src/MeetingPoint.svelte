<script>
    import { buildMap, findMeetingPoint, getStationFromId } from './findMeetingPoint.js'
    import MeetingPath from "./MeetingPath.svelte";

    var meetingPointInfo = null

    function onclick() {
        meetingPointInfo = findMeetingPoint(starts, ends)
    }
    
    export let starts = []
    export let ends = []
</script>

{#await buildMap()}
    <p>Loading...</p>
{:then map}
    <button on:click={onclick}><b>  Find  </b></button>

    {#if meetingPointInfo !== null}
        {#if meetingPointInfo === undefined || meetingPointInfo.end === undefined}
            <h2>No path found :(</h2>
        {:else}
            <h3>Best option: {meetingPointInfo.end}, average time: {meetingPointInfo.average}</h3>

            {#each meetingPointInfo.paths as path}
                <MeetingPath meetingPathInfo={path} />
            {/each}

        {/if}
    {/if}
{/await}

<style>
    button {
        min-height: 3em;
        min-width: 5em;
        padding: 0;
    }
</style>