<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	export let props;
	export let name;
</script>

<div class="holder">
	<label>
		<div>{name}</div>
		<input
			type="text"
			value={props[name]}
			on:input={(e) => {
				props[name] = e.target.value;
				$page.url.searchParams.set(name, props[name]);
			}}
		/>
	</label>
</div>

<style>
	.holder {
		padding-left: 1em;
	}

	label div {
		text-transform: capitalize;
		font-weight: 600;
		padding-top: 0.5em;
	}

	input {
		background-color: #fff;
	}
</style>
