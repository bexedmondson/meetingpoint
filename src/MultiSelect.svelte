<script>
    import MultiSelect from 'svelte-multiselect'
    import london from '../tubemaps/datasets/london.json'

    const stations = london.stations.map(a => a.name).sort()

    export let selected = []
</script>

<MultiSelect bind:selected options={stations} />

<style>
    ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	:global(li) {
		background: #111;
		color: #eee;
	}
</style>