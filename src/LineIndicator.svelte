<script>
    import london from '../tubemaps/datasets/london.json';

    let { line } = $props();

    let lineInfo = london.lines.find(element => element.line === line);

    if (lineInfo.stripe === "") {
        console.log(lineInfo.stripe)
        lineInfo.stripe = lineInfo.colour;
    }
</script>

<div class="lineContainer">
    <span class="lineName">{lineInfo.name}</span>

    <div class="line" style="background-image: linear-gradient(0deg, {lineInfo.colour} 33.3%, {lineInfo.stripe} 33.3%, {lineInfo.stripe} 66.7%, {lineInfo.colour} 66.7%, {lineInfo.colour} 100%)"></div>
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