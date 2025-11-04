<script>
    import { buildMap, findMeetingPoint } from './findMeetingPoint.js'
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

    <div class="">
    {#if meetingPointInfo !== null}
        {#if meetingPointInfo === undefined || meetingPointInfo.end === undefined}
            <h2>No path found :(</h2>
        {:else}
            <h3>Best option: {meetingPointInfo.end}, average time: {meetingPointInfo.average}</h3>

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
    .paths {
        width: 100%;
        display: grid;
        gap: 1em;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }

    button {
        min-height: 3em;
        min-width: 5em;
        padding: 0;
    }
</style>