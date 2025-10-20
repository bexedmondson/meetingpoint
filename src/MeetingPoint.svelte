<script>
    import { buildMap, findMeetingPoint, getStationFromId } from './findMeetingPoint.js'

    var meetingPointInfo = null

    function onclick() {
        meetingPointInfo = findMeetingPoint(starts, ends)
    };
    
    export let starts = []
    export let ends = []
</script>

{#await buildMap()}
    <p>Loading...</p>
{:then map}
    <button on:click={onclick}><h3>  Find  </h3></button>

    {#if meetingPointInfo !== null}
        {#if meetingPointInfo.end === undefined}
            <h2>No path found :(</h2>
        {:else}
            Best option: {meetingPointInfo.end}, average time: {meetingPointInfo.average}
        {/if}
    {/if}
{/await}

<style>
    button {
        min-height: 3em;
        min-width: 5em;
        padding: 0em;
    }
</style>