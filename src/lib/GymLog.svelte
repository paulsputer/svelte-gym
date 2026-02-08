<script>
	// @ts-nocheck
	let { log } = $props();
</script>

<div class="holder">
	<hr />
	<div class="heading">Log</div>
	<div class="mono">
		{#each log as l}
			<div>{l}</div>
		{/each}
	</div>
</div>

<style>
	.holder {
		padding-top: 1em;
		color: #000;
	}

	.heading {
		text-transform: capitalize;
		font-weight: 600;
		padding-top: 0.5em;
	}

	.mono {
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.8em;
		font-weight: normal;
		white-space: nowrap;
		overflow: scroll;
	}
</style>
