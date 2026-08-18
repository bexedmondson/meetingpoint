<script>
    import lines from '../tubemaps/datasets/lines.json';
    import { GitCompare, Footprints, TrainFrontTunnel } from "@lucide/svelte";

    let { line, isEnter } = $props();

    let lineInfo = lines.find(element => element.line === line);

    if (lineInfo.stripe === "") {
        lineInfo.stripe = lineInfo.colour;
    }
</script>

<div class="lineContainer">
    {#if isEnter}
        <span class="lineName">{lineInfo.name.replace("Exit", "Enter")}</span>
    {:else}
        <span class="lineName">{lineInfo.name}</span>
    {/if}

    {#if lineInfo.icon === ""}
        <div class="line" style="background-image: linear-gradient(0deg, {lineInfo.colour} 33.3%, {lineInfo.stripe} 33.3%, {lineInfo.stripe} 66.7%, {lineInfo.colour} 66.7%, {lineInfo.colour} 100%)"></div>
    {:else if lineInfo.icon === "walk"}
        <Footprints class="lineIcon" color="#000" />
    {:else if lineInfo.icon === "traintunnel"}
        <TrainFrontTunnel class="lineIcon" color="#000" />
    {:else}
        <GitCompare class="lineIcon" color="#000" />
    {/if}
</div>

<style>
    .lineContainer {
        width: auto;
        padding: 1em;
        margin-bottom: 0.5em;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;
        background-color: #fff;
        border-radius: 0.5em;
    }

    .lineName {
        color: #000;
    }

    .lineIcon {
        width: 100%;
    }

    .line {
        width: 100%;
        height: 0.5em;
    }
</style>