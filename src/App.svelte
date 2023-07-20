<script>
	import MultiSelect from './MultiSelect.svelte';

	export let name;
</script>

<main>
<body>
	<h1 class="title">Hello {name}!</h1>
	<h2 class="description">Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</h2>

	<div class="grid">
		<div class="container">
			<MultiSelect></MultiSelect>
		</div>
	</div>
</body>
</main>

<style>
	:global(body) {
		font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
			Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
		background: #222;
		color: #eee;
	}

	body {
		padding: 30px;
		margin: 0;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	* {
		box-sizing: border-box;
	}

	img {
		max-width: 100%;
		height: auto;
	}

	h1,
	h2 {
		margin: 0;
	}

	button {
		padding: 0.5rem 1rem;
		font-weight: bold;
	}

	.container {
		min-height: 15vh;
		min-width: 100vh;
		padding: 0 0.5rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.title {
		margin: 0 0 1rem;
		line-height: 1.15;
		font-size: 3.6rem;
	}

	.title {
		text-align: center;
	}

	.title,
	.description {
		text-align: center;
	}

	.description {
		line-height: 1.5;
		font-size: 1.5rem;
	}

	.grid {
		justify-self: center;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 3rem;
	}
  
</style>