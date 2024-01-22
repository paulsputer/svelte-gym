<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	export let props;
	export let name;
	export let min;
	export let max;
	export let units;
	export let label = name;
</script>

<div class="holder">
	<label>
		<input
			type="range"
			{min}
			{max}
			on:input={(e) => {
				props[name] = e.target.value + units;
				$page.url.searchParams.set(name, props[name]);
			}}
		/>
		<span>{label ?? name}</span>
	</label>
</div>

<style>
	.holder {
		padding-left: 1em;
	}

	.holder label {
		color: #000;
	}

	label span {
		text-transform: capitalize;
	}
</style>
