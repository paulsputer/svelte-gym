<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	export let props;
	export let name;
	export let min;
	export let max;
</script>

<div class="holder">
	<label>
		<input
			type="range"
			{min}
			{max}
			on:input={(e) => {
				props[name] = e.target.value + 'px';
				$page.url.searchParams.set(name, props[name]);
			}}
		/>
		<span>{name}</span>
	</label>
</div>

<style>
	.holder {
		padding-left: 1em;
	}

	label span {
		text-transform: capitalize;
	}
</style>
