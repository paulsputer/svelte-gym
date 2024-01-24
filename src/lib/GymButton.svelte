<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	export let props;
	export let name;
	export let label = name;

	$: disabled = typeof props[name] === 'undefined';

	function trigger(e) {
		switch (typeof props[name]) {
			case 'function':
				{
					props[name]();
				}
				break;
			case 'undefined':
				{
				}
				break;
		}

		// NOTE: intentionally not setting url param
	}
</script>

<div class="holder">
	<button on:click={trigger} {disabled}>{label ?? name}</button>
</div>

<style>
	.holder {
		padding: 0 1em;
	}

	button {
		color: #000;
		background-color: #fff;
		padding: 0.25em 0.5em;
		margin: 0.5em;
	}
</style>
