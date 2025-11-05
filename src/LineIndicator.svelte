<script>
    import london from '../tubemaps/datasets/london.json';

    const svg = `<svg width="80%" height="80%" viewBox="0 0 490 410"><path xmlns="http://www.w3.org/2000/svg" fill="#E1251B" d="M381.468,203.13c0,72.383-58.715,131.08-131.098,131.08c-72.401,0-131.068-58.697-131.068-131.08   c0-72.371,58.668-131.05,131.068-131.05C322.753,72.079,381.468,130.759,381.468,203.13 M250.37,0   C138.162,0,47.211,90.951,47.211,203.13c0,112.202,90.951,203.159,203.159,203.159c112.184,0,203.13-90.957,203.13-203.159   C453.5,90.951,362.554,0,250.37,0"/></svg>`;

    let { line } = $props();

    const lineInfo = london.lines.find(element => element.line === line);
</script>

<div class="lineContainer">
    <span class="lineName">{lineInfo.name}</span>

    <div class="lineIcon">{@html svg}</div>
</div>

<style>
    .lineContainer {
        width: auto;
        padding: 1em;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;
    }

    .lineName {
        text-align: center;
    }

    .lineIcon {
        width: 150px;
    }
</style>