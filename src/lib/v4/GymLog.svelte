<script lang="ts">
	export let log: any[];
</script>

<article>
	<header>
		<h1>Log</h1>
	</header>
	<div class="mono">
		{#each log as l}
			<div>{l}</div>
		{/each}
	</div>
</article>

<style>
	.mono {
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.8em;
		font-weight: normal;
		white-space: nowrap;
		overflow: scroll;
	}
</style>
