<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	export let props;
	export let name;
	export let label = name;
	export let excludeFromPermalink = false;

	// Collection of options containing `label` and `value`
	export let options = [];

	const groupUuid = self.crypto.randomUUID();
</script>

<div class="holder">
	{#each options as { value, label }}
		<label>
			<input
				type="radio"
				name={groupUuid}
				on:change={(e) => {
					props[name] = e.target.value;

					if (!(excludeFromPermalink ?? false)) {
						$page.url.searchParams.set(name, props[name]);
					}
				}}
				bind:group={props[name]}
				{value}
			/>
			<span>{label}</span>
		</label>
	{/each}
	<span>{label ?? name}</span>
</div>

<style>
	.holder {
		margin: 0 0.5em 0 0;
		user-select: none;
		cursor: pointer;
	}

	.holder label {
		color: #000;
		padding: 0 0.5em;
	}
</style>
