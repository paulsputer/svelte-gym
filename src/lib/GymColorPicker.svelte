<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	interface GymColorPickerProps {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		props: Record<string, any>;
		name: string;
		label?: string;
		hideExtra?: boolean;
	}

	let {
		props = $bindable(),
		name,
		label = name,
		hideExtra = false
	}: GymColorPickerProps = $props();

	const optDefault = 'NONE';

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	let _initialVal = $state('#000000');

	$effect(() => {
		let v = getProp(name, props) ?? '#000000';

		let res = extraOpts.filter((e) => {
			return e.value === v || '' + e.value === String(v);
		});

		if (res.length > 0) {
			_initialVal = '#000000';
		} else {
			_initialVal = v as string;
		}
	});

	let _override = $derived.by(() => {
		let v = getProp(name, props) ?? '#000000';
		let res = extraOpts.filter((e) => {
			return e.value === v || '' + e.value === String(v);
		});
		if (res.length > 0) {
			return res[0].value as string;
		}
		return optDefault;
	});
</script>

<div class="gym-control">
	<span class="gym-label">{label ?? name}</span>
	<div class="gym-value-row">
		<span class="color-row">
			<input
				type="color"
				bind:value={_initialVal}
				oninput={(e) => {
					setProp((e.target as HTMLInputElement).value, name, props);
				}}
			/>
			<span class="hex-value">{_initialVal}</span>
		</span>
		{#if !hideExtra}
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_override}
				{optDefault}
				onselect={(v: string | number | boolean | null | undefined) => {
					setProp(v, name, props);
				}}
				onclear={() => {
					setProp('#000000', name, props);
				}}
			/>
		{/if}
	</div>
</div>

<style>
	.gym-control {
		padding: 0.4em 0.75em;
	}

	.gym-label {
		display: block;
		text-transform: capitalize;
		font-weight: 600;
		color: #000;
		text-align: left;
	}

	.gym-value-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.15em 0;
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
