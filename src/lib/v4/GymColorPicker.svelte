<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	export let props: Record<string, any>;
	export let name: string;
	export let label: string | undefined = undefined;
	export let hideExtra: boolean = false;

	$: _label = label ?? name;

	const optDefault = 'NONE';

	let _props = {
		_override: optDefault
	};

	let _initialVal = getProp(name, props) ?? '#000000';

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

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
		setProp(target.value, name, props);
		props = props;
	}
</script>

<div class="gym-control">
	<span class="gym-label">{_label}</span>
	<div class="gym-value-row">
		<span class="color-row">
			<input type="color" value={_initialVal} on:input={handleInput} />
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
