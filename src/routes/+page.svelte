<script lang="ts">
	import { TestHarness, restoreProps, GymCheckbox, GymLog, GymTextbox } from '../lib/index.js';
	import ExampleButton from './ExampleButton.svelte';
	import { page } from '$app/stores';
	let params = $page.url.searchParams;

	let log: string[] = [];
	let props = $state({
		label: 'default text',
		active: true,
		spinner: false,
		onclick: () => {
			const entry = `click event @ ${new Date().toUTCString()}`;
			log = [entry, ...log];
		}
	});

	restoreProps(props);
</script>

<TestHarness>
	{#snippet componentToTest()}
		<ExampleButton {...props}></ExampleButton>
	{/snippet}

	{#snippet controls()}
		<ul>
			<li><GymCheckbox bind:props name="active" /></li>
			<li><GymCheckbox bind:props name="spinner" /></li>
		</ul>
		<div>
			<GymTextbox bind:props name="label" />
		</div>
		<GymLog {log} />
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
