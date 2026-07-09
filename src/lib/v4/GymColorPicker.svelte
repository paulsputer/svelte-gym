<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	export let props: Record<string, any>;
	export let name: string;
	export let label: string | undefined = undefined;
	export let hideExtra: boolean = false;
	export let subLabel: string | undefined = undefined;
	export let fallback: string | undefined = undefined;

	$: _label = label ?? name;

	const optDefault = 'NONE';

	let _props = {
		_override: optDefault
	};

	let _initialVal = '#000000';
	$: {
		let v = getProp(name, props);
		if (v === undefined && fallback !== undefined) {
			v = fallback;
		}
		if (v === undefined) {
			v = '#000000';
		}
		let c = (v as string).trim();
		if (c.length === 4 && c.startsWith('#')) {
			c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
		}
		_initialVal = c;
	}

	const extraOpts = [{ label: 'null', value: null }];

	$: res = extraOpts.filter((e) => {
		if (e.value === _initialVal || '' + e.value === _initialVal) {
			return true;
		}
	});

	$: {
		if (res.length > 0) {
			// @ts-ignore - value can be null for override
			_props._override = res[0].value;
		} else {
			_props._override = optDefault;
		}
	}

	function handleSelect(v: string) {
		_props._override = v;
		setProp(v, name, props);
		props = props;
	}

	function handleClear() {
		_props._override = optDefault;
		setProp(_initialVal, name, props);
		props = props;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		_initialVal = target.value;
		_props._override = optDefault;
		setProp(target.value, name, props, undefined, true);
		props = props;
	}

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		setProp(target.value, name, props, undefined, false);
		props = props;
	}
</script>

<div class="gym-control">
	<span class="gym-label">{_label}</span>
	{#if subLabel}
		<div class="gym-sublabel" title={subLabel}>{subLabel}</div>
	{/if}
	<div class="gym-value-row">
		<span class="color-row">
			<input type="color" value={_initialVal} on:input={handleInput} on:change={handleChange} />
			<span class="hex-value">{_initialVal}</span>
		</span>
		{#if !hideExtra}
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_props._override}
				{optDefault}
				onselect={handleSelect}
				onclear={handleClear}
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
