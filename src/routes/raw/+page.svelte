<script lang="ts">
	import { TestHarness, stringToBool, GymSlider, GymLog, GymTextbox } from '../../lib';
	import { page } from '$app/stores';
	import { restoreProps } from '../../lib/helpers.js';

	let params = $page.url.searchParams;

	let log: string[] = [];
	let props = {
		label: '',
		label_nest: {
			label: '',
			nest: {
				label: ''
			}
		},
		num: '',
		num_nest: {
			num: '',
			nest: {
				num: ''
			}
		}
	};

	restoreProps(props);
</script>

<TestHarness>
	<svelte:fragment slot="componentToTest">
		<section>
			<div>
				<h1>Label</h1>

				<ul>
					<li>label: {props.label}</li>
					<li>label nested once: {props.label_nest.label}</li>
					<li>label nested twice: {props.label_nest.nest.label}</li>
				</ul>
			</div>
			<div>
				<h1>Num</h1>
				<ul>
					<li>num: {props.num}</li>
					<li>num nested once: {props.num_nest.num}</li>
					<li>num nested twice: {props.num_nest.nest.num}</li>
				</ul>
			</div>
		</section>
	</svelte:fragment>

	<svelte:fragment slot="controls">
		<div>
			<GymTextbox bind:props name="label" label="L0 label" />
			<GymTextbox bind:props name="label_nest.label" label="L1 label" />
			<GymTextbox bind:props name="label_nest.nest.label" label="L2 label" />
		</div>
		<div>
			<GymSlider bind:props name="num" label="L0 num" />
			<GymSlider bind:props name="num_nest.num" label="L1 num" />
			<GymSlider bind:props name="num_nest.nest.num" label="L2 num" />
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
