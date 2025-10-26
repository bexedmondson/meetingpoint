<script>
	import MultiSelect from './MultiSelect.svelte';
	import MeetingPoint from './MeetingPoint.svelte';

	let starts=[]
	let ends=[]
</script>

<div class="sidebar">
    <div class="bar">
        <div class="circle">
            <div class="cutout" />
        </div>
    </div>
</div>

<div class="grid">
    <div class="header"><a href="https://bexedmondson.com">&lt; Back</a></div>

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

<style>
    :global(html, body) {
        min-height: 100vh;
    }

	:global(body) {
        overflow: auto;
        font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
        Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        background: #222;
        color: #eee;
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

    .header {
        width: 100%;
        float: left;
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
		margin: 3rem 0 1rem;
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
        width: min(95%, calc(100% - 75px));
        float: right;
        padding: 30px;
        display: flex;
        flex-direction: column;
		justify-self: center;
		align-items: center;
		justify-content: center;
	}

    .sidebar {
        position: fixed;
        height: 100vh;
        width: 100px;
        display: grid;
        align-items: center;
    }

    .bar {
        position: relative;
        display: grid;
        background-color: #eee;
        margin: 0 auto 0 auto;
        height: 100%;
        width: 15px;
        justify-content: center;
    }

    .circle .cutout {
        position: relative;
    }

    .circle {
        justify-self: center;
        align-items: center;
        background-color: #eee;
        margin-top: 80px;
        height: 50px;
        width: 50px;
        margin-left: auto;
        margin-right: auto;
        border-radius: 50%;
    }

    .cutout {
        background-color: #222;
        height: 25px;
        width: 25px;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

</style>