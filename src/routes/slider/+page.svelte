<script lang="ts">
	import { TestHarness, GymLog } from '../../lib/index.ts';
	import { restoreProps } from '../../lib/helpers.js';
	import GymSlider from '$lib/GymSlider.svelte';

	let log: string[] = [];
	let props = {
		basic: 0,
		withFn: 0
	};

	const functor = (v) => v / 100;

	restoreProps(props);
</script>

<TestHarness>
	<svelte:fragment slot="componentToTest">
		<section>
			<div>
				<h1>slider</h1>
				<ul>
					<li>basic: {props.basic}</li>
					<li>Functor: {props.withFn}</li>
				</ul>
			</div>
		</section>
	</svelte:fragment>

	<svelte:fragment slot="controls">
		<div>
			<GymSlider bind:props name="basic" label="basic slider" />
			<GymSlider bind:props name="withFn" label="with Functor" fn={functor} />
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

	section {
		display: flex;
		flex-direction: column;
		flex: auto;
	}
</style>
