<script lang="ts">
	import { TestHarness, restoreProps, GymCheckbox, GymTextbox } from '../lib/index.js';
	import ExampleButton from './ExampleButton.svelte';

	let log = $state<string[]>([]);
	let props = $state({
		label: 'default text',
		active: true,
		spinner: false,
		onclick: () => {
			const entry = `click event @ ${new Date().toUTCString()}`;
			log = [entry, ...log];
		}
	});

	$effect.pre(() => {
		restoreProps(props);
	});
</script>

<TestHarness {log}>
	{#snippet componentToTest()}
		<ExampleButton {...props}></ExampleButton>
	{/snippet}

	{#snippet controls()}
		<ul>
			<li><GymCheckbox bind:props name="active" /></li>
			<li><GymCheckbox bind:props name="spinner" /></li>
		</ul>
		<div data-testid="test-label">
			<GymTextbox bind:props name="label" />
		</div>
	{/snippet}
</TestHarness>

<style>
	:root {
		--primary: #c30;
		--primary-inverted: #201c1b;
		--primary-inactive: #eee;
	}

	ul {
		list-style-type: none;
		padding-left: 1em;
	}
</style>
