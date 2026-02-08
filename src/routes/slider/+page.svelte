<script lang="ts">
	import { TestHarness, GymLog } from '../../lib/index.ts';
	import { restoreProps } from '../../lib/helpers.js';
	import GymSlider from '$lib/GymSlider.svelte';

	let log: string[] = [];
	let props = $state({
		basic: 0,
		minMaxOverride: 0,
		withFn: 0,
		px: 0,
		em: 0,
		rem: 0,
		pc: 0
	});

	const functor = (v: number) => v / 100;

	restoreProps(props);
</script>

<TestHarness>
	{#snippet componentToTest()}
		<section>
			<div>
				<h1>slider</h1>
				<ul>
					<li>basic: {props.basic}</li>
					<li>min/max override: {props.minMaxOverride}</li>
					<li>Functor: {props.withFn}</li>
				</ul>
				<ul>
					<h2>Auto min/max</h2>
					<li>px: {props.px}</li>
					<li>em: {props.em}</li>
					<li>rem: {props.rem}</li>
					<li>%: {props.pc}</li>
				</ul>
			</div>
		</section>
	{/snippet}

	{#snippet controls()}
		<div>
			<GymSlider bind:props name="basic" label="basic slider" />
			<GymSlider bind:props name="minMaxOverride" label="min max override" min={-100} max={100} />
			<GymSlider bind:props name="withFn" label="with Functor" fn={functor} />
			<GymSlider bind:props units="px" name="px" label="auto scale px" />
			<GymSlider bind:props units="em" name="em" label="auto scale em" />
			<GymSlider bind:props units="rem" name="rem" label="auto scale rem" />
			<GymSlider bind:props units="%" name="pc" label="auto scale pc" />
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
