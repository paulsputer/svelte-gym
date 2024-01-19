<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	export let props;
	export let name;
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
		<span>{name}</span>
	</label>
</div>

<style>
	.holder label {
		color: #000;
	}

	label span {
		text-transform: capitalize;
	}
</style>
