<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	export let props;
	export let name;
	export let options = [];
	export let label = name;
</script>

<div class="holder">
	<label>
		<span>{label ?? name}</span>
		<select
			bind:value={props[name]}
			on:input={(e) => {
				props[name] = e.target.value;
				$page.url.searchParams.set(name, props[name]);
			}}
		>
			{#each options as opt}
				<option value={opt}>
					{opt}
				</option>
			{/each}
		</select>
	</label>
</div>

<style>
	.holder {
		padding: 0 1em;
	}

	.holder label {
		color: #000;
	}

	label span {
		text-transform: capitalize;
		font-weight: 600;
		padding-top: 0.5em;
	}

	select {
		background-color: #fff;
	}
</style>
