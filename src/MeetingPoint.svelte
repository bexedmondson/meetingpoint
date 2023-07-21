<script>
    import { findMeetingPoint } from './findMeetingPoint.js'

    let hasResult = false
    let meetingPoint = null

    function onclick() {
        hasResult = true;
        meetingPoint = findMeetingPoint(starts, ends)
    };
    
    export let starts = []
    export let ends = []
</script>


<button on:click={onclick}><h3>  Find  </h3></button>
{#if hasResult}
    <h2>{meetingPoint}</h2>
{/if}

<style>
    button {
        min-height: 3em;
        min-width: 5em;
        padding: 0em;
    }
</style>