<script>
    import MultiSelect from 'svelte-multiselect'
	import stations from '../tubemaps/datasets/stations.json'

    const stationsSorted = Object.values(stations).map(a => a.name).sort()

    export let selected = []
</script>

<MultiSelect bind:selected options={stationsSorted} />

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