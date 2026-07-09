<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	interface GymColorPickerProps {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		props: Record<string, any>;
		name: string;
		label?: string;
		hideExtra?: boolean;
		subLabel?: string;
		fallback?: string;
	}

	let {
		props = $bindable(),
		name,
		label = name,
		hideExtra = false,
		subLabel = undefined,
		fallback = undefined
	}: GymColorPickerProps = $props();

	const optDefault = 'NONE';

	const extraOpts = [{ label: 'null', value: null }];

	let _initialVal = $state('#000000');

	$effect(() => {
		let v = getProp(name, props);
		if (v === undefined && fallback !== undefined) {
			v = fallback;
		}
		if (v === undefined) {
			v = '#000000';
		}

		let res = extraOpts.filter((e) => {
			return e.value === v || '' + e.value === String(v);
		});

		if (res.length > 0) {
			_initialVal = '#000000';
		} else {
			let c = (v as string).trim();
			if (c.length === 4 && c.startsWith('#')) {
				c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
			}
			_initialVal = c;
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
	{#if subLabel}
		<div class="gym-sublabel" title={subLabel}>{subLabel}</div>
	{/if}
	<div class="gym-value-row">
		<span class="color-row">
			<input
				type="color"
				bind:value={_initialVal}
				oninput={(e) => setProp((e.target as HTMLInputElement).value, name, props, undefined, true)}
				onchange={(e) =>
					setProp((e.target as HTMLInputElement).value, name, props, undefined, false)}
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

	.gym-sublabel {
		font-size: 0.65rem;
		color: #888;
		margin-top: -0.25em;
		margin-bottom: 0.4em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-family: monospace;
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
