<script>
    import PathFromTo from "./PathFromTo.svelte";

    export let meetingPathInfo;
</script>

{#if meetingPathInfo === undefined || meetingPathInfo.finalPath === undefined}
    <p>No path found <PathFromTo path={meetingPathInfo.finalPath} /> :(</p>
{:else}
    <p>Path <PathFromTo path={meetingPathInfo.finalPath} />, duration {meetingPathInfo.cost}</p>
{/if}

<style>
</style>