<script>
	let items = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);
</script>

<div class="scrolling-demo">
	<h1>Scrolling Demo</h1>
	<p>This is a long component to test vertical scrolling in Svelte Gym.</p>
	<ul>
		{#each items as item}
			<li>{item}</li>
		{/each}
	</ul>
</div>

<style>
	.scrolling-demo {
		padding: 20px;
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid #ccc;
		width: 100%;
		max-width: 600px;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		padding: 10px;
		border-bottom: 1px solid #eee;
	}
</style>
