<script>
    import { buildMap, findMeetingPoint, getStationFromId } from './findMeetingPoint.js'

    var hasResult = false
    var meetingPointInfo = null

    function onclick() {
        meetingPointInfo = findMeetingPoint(starts, ends)
        hasResult = true;

        (console.log(meetingPointInfo), '')
    };
    
    export let starts = []
    export let ends = []
</script>

{#await buildMap()}
    <p>Loading...</p>
{:then map}
    <button on:click={onclick}><h3>  Find  </h3></button>
    {#if hasResult}
        <h2>{meetingPointInfo.end}</h2>
        {#each meetingPointInfo.path as pathPoint}
            <h3>{getStationFromId(pathPoint)}</h3>
        {/each}
    {/if}
{/await}

<style>
    button {
        min-height: 3em;
        min-width: 5em;
        padding: 0em;
    }
</style>