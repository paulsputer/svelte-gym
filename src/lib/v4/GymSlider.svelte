<script lang="ts">
	import GymOverrideButtons from './GymOverrideButtons.svelte';
	import GymInterpolateMenu from './GymInterpolateMenu.svelte';
	import { setProp, getProp } from './helpers.js';

	export let props: Record<string, any>;
	export let name: string;
	export let min: number | null = null;
	export let max: number | null = null;
	export let step: number | null = null;
	export let units: string | null = null;
	export let fn: ((v: number) => number) | null = null;
	export let label: string | undefined = undefined;
	export let hideExtra: boolean = false;
	export let interpMenu: GymInterpolateMenu | undefined = undefined;

	$: _label = label ?? name;

	const optDefault = 'NONE';

	let _props = {
		_override: optDefault
	};

	let _step = step ?? 1;

	$: {
		// Set defaults if null, based on units
		if (min === null) {
			switch (units) {
				case 'em':
				case 'rem':
					min = 0.1;
					break;
				default:
					min = 0;
					break;
			}
		}

		if (max === null) {
			switch (units) {
				case 'px':
					if (name.includes('font')) {
						max = 100;
					} else {
						max = typeof window !== 'undefined' ? window.innerWidth : 1920;
					}
					break;
				case 'em':
				case 'rem':
					max = 10;
					break;
				case 'vw':
				case 'vh':
				case 'svh':
				case 'dvh':
				case 'lvh':
				case '%':
					max = 100;
					break;
				default:
					max = 100;
					break;
			}
		}

		// Set step based on units
		if (step === null) {
			switch (units) {
				case 'em':
				case 'rem':
				case 'vw':
				case 'vh':
				case 'svh':
				case 'dvh':
				case 'lvh':
					_step = 0.1;
					break;
				default:
					_step = 1;
					break;
			}
		}

		// React to external prop changes (e.g. via bind:scrollTop)
		let rawVal = getProp(name, props);

		// Strip units if it matches our current units or generally parse it
		if (typeof rawVal === 'string') {
			const num = parseFloat(rawVal);
			if (!isNaN(num)) {
				// Round to nearest step to avoid floating point precision issues
				const prec = _step < 1 ? 10 : 1;
				rawVal = Math.round(num * prec) / prec;
			}
		}

		const currentVal = rawVal;
		if (currentVal != _initialVal) {
			_initialVal = currentVal;
		}
	}

	const extraOpts = [
		{ label: 'NaN', value: 'NaN' },
		{ label: 'Inf', value: Infinity },
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	const unitOpts = [
		'px',
		'em',
		'rem',
		'%',
		'ch',
		'vw',
		'vh',
		'svh',
		'lvh',
		'dvh',
		'svw',
		'lvw',
		'dvw'
	];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function applyFunctor(v: any) {
		if (typeof v === 'number' && fn) {
			return fn(v);
		}

		return v;
	}

	let _initialVal = applyFunctor(getProp(name, props));

	$: _decimals = (() => {
		const s = String(_step);
		const dot = s.indexOf('.');
		return dot === -1 ? 0 : s.length - dot - 1;
	})();

	function formatVal(v: any): string {
		if (typeof v === 'number' && _decimals > 0) {
			return v.toFixed(_decimals);
		}
		return String(v ?? '');
	}

	$: {
		// Detect units from initial value if not provided
		if (units === null && typeof _initialVal === 'string') {
			const possibleUnits = unitOpts.filter((e) => {
				return _initialVal.endsWith(e);
			});

			const u = possibleUnits.reduce((a: string | null, e) => {
				return e.length > (a ?? '').length ? e : a;
			}, null);

			if (u) {
				units = u;
				_initialVal = _initialVal.slice(0, -u.length);
			}
		} else if (units) {
			// If units provided, strip them from initial value
			if (typeof _initialVal === 'string' && _initialVal.endsWith(units)) {
				_initialVal = _initialVal.slice(0, -units.length);
			}
		}
	}

	$: res = extraOpts.find((e) => {
		return e.value === _initialVal || '' + e.value === _initialVal;
	});

	$: {
		if (res) {
			_props._override = res.value as string;
		} else {
			_props._override = optDefault;
		}
	}

	function handleSelect(v: string) {
		_props._override = v;
		let finalVal: string | number | undefined | null = v;
		if (finalVal === 'NaN') {
			finalVal = Number.NaN;
		}
		if (finalVal === 'undefined') {
			finalVal = undefined;
		}
		setProp(finalVal, name, props, units ?? undefined);
		props = props;
	}

	function handleClear() {
		_props._override = optDefault;
		setProp(applyFunctor(_initialVal), name, props, units ?? undefined);
		props = props;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		_props._override = optDefault;
		_initialVal = +target.value;
		setProp(applyFunctor(+target.value), name, props, units ?? undefined);
		props = props;
	}
</script>

<div class="gym-control">
	<span class="gym-label"
		><GymInterpolateMenu
			bind:this={interpMenu}
			mode="slider"
			sliderMin={min ?? 0}
			sliderMax={max ?? 100}
			sliderValue={_initialVal}
			{units}
			propName={name}
			bind:props
		/>{_label}</span
	>
	<div class="gym-value">
		<span class="value-indicator"
			>{#if _props._override !== optDefault}{extraOpts.find((e) => e.value === _props._override)
					?.label ?? ''}{:else}{formatVal(_initialVal)}{typeof _initialVal === 'number' ||
				(typeof _initialVal === 'string' && !isNaN(Number(_initialVal)))
					? (units ?? '')
					: ''}{/if}</span
		>
		<input
			type="range"
			min={min ?? 0}
			max={max ?? 100}
			step={_step}
			on:input={handleInput}
			bind:value={_initialVal}
		/>
	</div>
	{#if !hideExtra}
		<div class="gym-overrides">
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_props._override}
				{optDefault}
				onselect={handleSelect}
				onclear={handleClear}
			/>
		</div>
	{/if}
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

	.gym-value {
		padding: 0.15em 0;
	}

	.gym-overrides {
		padding-top: 0.15em;
	}

	input[type='range'] {
		width: 100%;
		box-sizing: border-box;
	}

	.value-indicator {
		display: block;
		text-align: center;
		font-variant-numeric: tabular-nums;
		font-family: monospace;
		font-size: 0.75em;
		line-height: 1;
		margin: 0;
		padding: 0;
	}
</style>
