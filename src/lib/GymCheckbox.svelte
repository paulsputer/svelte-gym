<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	export let props;
	export let name;
	export let label = name;
</script>

<div class="holder">
	<label>
		<input
			type="checkbox"
			checked={props[name]}
			on:input={(e) => {
				props[name] = e.target.checked;
				$page.url.searchParams.set(name, props[name]);
			}}
		/>
		<span>{label ?? name}</span>
	</label>
</div>

<style>
	.holder {
		margin: 0 0.5em 0 0;
		user-select: none;
		cursor: pointer;
	}

	.holder label {
		color: #000;
	}
</style>
