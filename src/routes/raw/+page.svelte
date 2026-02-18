<script lang="ts">
	import {
		TestHarness,
		GymSlider,
		GymLog,
		GymTextbox,
		GymDropdown,
		GymCheckbox
	} from '../../lib/index.js';
	import { page } from '$app/stores';
	import { restoreProps } from '../../lib/helpers.js';

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
		numArray: [32, 64, 128],
		num_nest: {
			numArray: [32, 64, 128],
			num: '',
			nest: {
				num: ''
			}
		},
		flag: true,
		flagArray: [false, false, false],
		flag_nest: {
			flag: false,
			flagArray: [false, false, false],
			nest: {
				flag: false
			}
		},
		dropdown: {
			stringArray: 'a',
			object: 'a',
			objectArray: 'a'
		},
		dropdown_nest: {
			dropdown: '',
			nest: {
				dropdown: ''
			}
		}
	};

	$effect.pre(() => {
		restoreProps(props);
	});
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
			<div>
				<h1>Dropdown</h1>
				<ul>
					<li>options as string array: {props.dropdown.stringArray}</li>
					<li>options as object: {props.dropdown.object}</li>
					<li>objects as object array: {props.dropdown.objectArray}</li>
				</ul>
			</div>
			<div>
				<h1>Num Array</h1>
				<ul>
					<li>num array: {props.numArray}</li>
					<li>num nested once array: {props.num_nest.numArray}</li>
				</ul>
			</div>
			<div>
				<h1>Flags</h1>
				<ul>
					<li>flag: {props.flag}</li>
					<li>flag nested once: {props.flag_nest.flag}</li>
					<li>flag nested twice: {props.flag_nest.nest.flag}</li>
				</ul>
			</div>
			<div>
				<h1>Flag Array</h1>
				<ul>
					<li>flag: {props.flagArray}</li>
					<li>flag nested once: {props.flag_nest.flagArray}</li>
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
			<GymDropdown
				bind:props
				name="dropdown.stringArray"
				label="L0 label"
				options={['a', 'b', 'c']}
			/>
			<GymDropdown
				bind:props
				name="dropdown.object"
				label="L1 label"
				options={{ a: 'A', b: 'B' }}
			/>
			<GymDropdown
				bind:props
				name="dropdown.objectArray"
				label="L2 label"
				options={[
					{ label: 'A', value: 'a' },
					{ label: 'B', value: 'b' }
				]}
			/>
		</div>
		<div>
			<GymSlider bind:props name="num" label="L0 num" />
			<GymSlider bind:props name="num_nest.num" label="L1 num" />
			<GymSlider bind:props name="num_nest.nest.num" label="L2 num" />
			<GymSlider bind:props name="numArray.0" label="Array 0" />
			<GymSlider bind:props name="numArray.1" label="Array 1" />
			<GymSlider bind:props name="num_nest.numArray.0" label="Nested Array 0" />
			<GymSlider bind:props name="num_nest.numArray.1" label="Nested Array 1" />
		</div>
		<div>
			<GymCheckbox bind:props name="flag" label="L0 Flag" />
			<GymCheckbox bind:props name="flag_nest.flag" label="L1 Flag" />
			<GymCheckbox bind:props name="flag_nest.nest.flag" label="L2 Flag" />
			<GymCheckbox bind:props name="flagArray.0" label="Array 0" />
			<GymCheckbox bind:props name="flagArray.1" label="Array 1" />
			<GymCheckbox bind:props name="flag_nest.flagArray.0" label="Nested Array 0" />
			<GymCheckbox bind:props name="flag_nest.flagArray.1" label="Nested Array 1" />
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
