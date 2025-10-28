<script>
    import { getStationFromId } from './findMeetingPoint.js'

    export let path = null;

    let start = -1;
    let end = -1;

    if (path != null && path.length > 0) {
        start = path[0];
        end = path.at(-1);
    }
</script>

{#if path !== null && start !== -1 && end !== -1}
    from {getStationFromId(start)} to {getStationFromId(end)}
{/if}

<style>
</style>