<script lang="ts">

	interface GymRadioGroupProps {
		props: Record<string, any>;
		name: string;
		label?: string;
		excludeFromPermalink?: boolean;
		options?: Array<{ label: string; value: any }>;
	}

	let {
		props = $bindable(),
		name,
		label = name,
		excludeFromPermalink = false,
		options = []
	}: GymRadioGroupProps = $props();

	let _counter = 0;
	const groupId = `gym-radio-${_counter++}-${Date.now()}`;
</script>

<div class="holder">
	{#each options as { value, label }}
		<label>
			<input
				type="radio"
				name={groupId}
				on:change={(e) => {
					props[name] = e.target.value;

					if (!(excludeFromPermalink ?? false) && typeof window !== 'undefined') {
						const url = new URL(window.location.href);
						url.searchParams.set(name, props[name]);
						history.replaceState(null, '', url);
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
