<script>
    import london from '../tubemaps/datasets/london.json';

    export let line;

    const lineInfo = london.lines.find(element => element.line === line);
    console.log(lineInfo);
    console.log(london.lines)
    console.log(line)
</script>

{lineInfo.name}

<style>
</style>