<script>
	import MultiSelect from './MultiSelect.svelte';
	import MeetingPoint from './MeetingPoint.svelte';

	let starts=[]
	let ends=[]
</script>

<main>
<body>
    <div class="header"><a href="https://bexedmondson.com">Back</a></div>

    <div class="grid">

        <h1 class="title">Meeting Point</h1>
        <h2 class="description">Add you and your friends' starting points and a list of potential meetup locations, and hit the Find button to see the best point to meet.</h2>

		<div class="container">
			<h2>Start stations:</h2>

			<MultiSelect bind:selected={starts}></MultiSelect>
		</div>
		<div class="container">
			<h2>End stations:</h2>

			<MultiSelect bind:selected={ends}></MultiSelect>
		</div>

		<div class="container">
			<MeetingPoint starts={starts} ends={ends}></MeetingPoint>
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
		margin: 1em;
	}

	button {
		padding: 0.5rem 1rem;
		font-weight: bold;
	}

	.container {
		min-height: 15vh;
		min-width: 100vh;
		padding: 0.5rem;
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
        padding: 30px;
        display: flex;
        flex-direction: column;
		justify-self: center;
		align-items: center;
		justify-content: center;
		margin-top: 3rem;
	}
  
</style>