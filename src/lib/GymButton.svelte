<script lang="ts">
	interface GymButtonProps {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		props: Record<string, any>;
		name: string;
		label?: string;
	}

	let { props, name, label = name }: GymButtonProps = $props();

	let disabled = $derived(typeof props[name] === 'undefined');

	function trigger() {
		switch (typeof props[name]) {
			case 'function':
				{
					props[name]();
				}
				break;
		}

		// NOTE: intentionally not setting url param
	}
</script>

<div class="holder">
	<button onclick={trigger} {disabled}>{label ?? name}</button>
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
