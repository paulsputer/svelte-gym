<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymRadioGroup from './GymRadioGroup.svelte';

	interface GymColorPickerProps {
		props: Record<string, any>;
		name: string;
		label?: string;
		hideExtra?: boolean;
	}

	let { props = $bindable(), name, label = name, hideExtra = false }: GymColorPickerProps = $props();

	const optDefault = 'NONE';

	let _props = $state({
		_override: optDefault
	});

	$effect(() => {
		let v = _props._override;

		if (v !== optDefault) {
			_initialVal = '#000000';
			setProp(v, name, props);
		}
	});

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	let _initialVal = $state(getProp(name, props) ?? '#000000');
	let res = extraOpts.filter((e) => {
		if (e.value === _initialVal || '' + e.value === _initialVal) {
			return true;
		}
	});

	if (res.length > 0) {
		// @ts-ignore - value can be null for override
		_props._override = res[0].value;
		_initialVal = '#000000';
	} else {
		_props._override = optDefault;
	}
</script>

<div class="holder">
	<label>
		<span>{label ?? name}</span>
		<span class="color-row">
			<input
				type="color"
				bind:value={_initialVal}
				oninput={(e) => {
					_props._override = optDefault;
					setProp((e.target as HTMLInputElement).value, name, props);
				}}
			/>
			<span class="hex-value">{_initialVal}</span>
		</span>
	</label>
	{#if !hideExtra}
		<GymRadioGroup
			excludeFromPermalink={true}
			bind:props={_props}
			name="_override"
			label=""
			options={extraOpts}
		/>
	{/if}
</div>

<style>
	.holder {
		padding: 0 1em;
	}

	.holder label {
		color: #000;
	}

	label span {
		text-transform: capitalize;
		font-weight: 600;
		padding-top: 0.5em;
	}

	.color-row {
		display: flex;
		align-items: center;
		gap: 0.5em;
		font-weight: 400;
	}

	.hex-value {
		font-family: monospace;
		font-size: 0.85em;
		text-transform: uppercase;
	}

	input[type='color'] {
		width: 2em;
		height: 2em;
		padding: 0;
		border: 1px solid #999;
		cursor: pointer;
		background: none;
	}
</style>
