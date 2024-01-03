<script lang="ts">
	import { TestHarness, stringToBool, GymCheckbox, GymLog, GymTextbox } from '../lib';
	import ExampleButton from './ExampleButton.svelte';
	import { page } from '$app/stores';
	let params = $page.url.searchParams;

	let log: string[] = [];
	let props = {
		label: params.get('label') || 'default text',
		active: stringToBool(params.get('active')) ?? true,
		spinner: stringToBool(params.get('spinner')) ?? false,
		onclick: () => {
			console.log('>>');
			const entry = `click event @ ${new Date().toUTCString()}`;
			log = [entry, ...log];
		}
	};
</script>

<TestHarness>
	<svelte:fragment slot="componentToTest">
		<ExampleButton {...props}></ExampleButton>
	</svelte:fragment>

	<svelte:fragment slot="controls">
		<ul>
			<li><GymCheckbox bind:props name="active" /></li>
			<li><GymCheckbox bind:props name="spinner" /></li>
		</ul>
		<div>
			<GymTextbox bind:props name="label" />
		</div>
		<GymLog {log} />
	</svelte:fragment>
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
