<script lang="ts">
	import { TestHarness, GymLog, GymDropdown } from '../../lib/index.js';
	import { restoreProps } from '../../lib/helpers.js';

	let log: string[] = [];
	let props = $state({
		stringArray: null,
		object: null,
		objectArray: null,
		objectArray2: null
	});

	const optStringArray = ['OPT A', 'OPT B', 'OPT C', 'OPT D'];
	const optObject = { optA: 'OPT A', optB: 'OPT B', optC: 'OPT C', optD: 'OPT D' };
	const optObjectArray = [
		{ label: 'opt-a', value: 'OPT A', name: 'test-a', val2: 'OPT A2' },
		{ label: 'opt-b', value: 'OPT B', name: 'test-b', val2: 'OPT B2' },
		{ label: 'opt-c', value: 'OPT C', name: 'test-c', val2: 'OPT C2' },
		{ label: 'opt-d', value: 'OPT D', name: 'test-d', val2: 'OPT D2' }
	];

	$effect.pre(() => {
		restoreProps(props);
	});
</script>

<TestHarness>
	{#snippet componentToTest()}
		<section>
			<div>
				<h1>Dropdown</h1>
				<ul>
					<li>options as string array: {props.stringArray}</li>
					<li>options as object: {props.object}</li>
					<li>objects as object array: {props.objectArray}</li>
					<li>objects as object array 2: {props.objectArray2}</li>
				</ul>
			</div>
		</section>
	{/snippet}

	{#snippet controls()}
		<div>
			<GymDropdown bind:props name="stringArray" label="string array" options={optStringArray} />
			<GymDropdown bind:props name="object" label="object" options={optObject} />
			<GymDropdown
				bind:props
				name="objectArray"
				label="object array default"
				options={optObjectArray}
			/>
			<GymDropdown
				bind:props
				name="objectArray2"
				label="object array override"
				options={optObjectArray}
				optLabel="name"
				optValue="val2"
			/>
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

	section {
		display: flex;
		flex-direction: column;
		flex: auto;
	}
</style>
