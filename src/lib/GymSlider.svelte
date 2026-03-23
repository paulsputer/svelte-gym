<script lang="ts">
	import GymOverrideButtons from './GymOverrideButtons.svelte';
	import GymInterpolateMenu from './GymInterpolateMenu.svelte';
	import { setProp, getProp } from './helpers.js';

	interface GymSliderProps {
		props: Record<string, any>;
		name: string;
		min?: number | null;
		max?: number | null;
		step?: number | null;
		units?: string | null;
		fn?: ((v: number) => number) | null;
		label?: string;
		hideExtra?: boolean;
		interpMenu?: GymInterpolateMenu;
	}

	let {
		props = $bindable(),
		name,
		min = null,
		max = null,
		step = null,
		units = null,
		fn = null,
		label = name,
		hideExtra = false,
		interpMenu = $bindable()
	}: GymSliderProps = $props();

	const optDefault = 'NONE';

	let _props = $state({
		_override: optDefault
	});

	let _step = $state(step ?? 1);

	$effect(() => {
		let v = _props._override;

		if (v !== optDefault) {
			if (v === 'NaN') {
				// Force as Number.NaN
				v = +v;
			}
			setProp(v, name, props, units);
		}
	});

	$effect(() => {
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
					// Default to a reasonable screen width if px, but for fonts 100 is better.
					// However, GymSlider is generic.
					// If name implies font (hacky but useful?) No, let's stick to safe defaults.
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

		// override functor based on units
		// but only if no functor defined
		if (fn === null) {
			switch (
				units
				// No default functors needed anymore as we use step for precision
			) {
			}
		}

		// React to external prop changes (e.g. via bind:scrollTop)
		let rawVal = getProp(name, props);

		// Strip units if it matches our current units or generally parse it
		if (typeof rawVal === 'string') {
			const num = parseFloat(rawVal);
			if (!isNaN(num)) {
				// Round to nearest step to avoid floating point precision issues
				// e.g. 1.5 -> 1.5, but 1.49999 -> 1.5
				const prec = _step < 1 ? 10 : 1;
				rawVal = Math.round(num * prec) / prec;
			}
		}

		const currentVal = rawVal;
		// Use loose equality or check for significant difference to avoid loop artifacts
		if (currentVal != _initialVal) {
			_initialVal = currentVal;
		}
	});

	const extraOpts = [
		// NOTE: Important to define NaN as a string else comparison won't work
		// and radio buttons will not activate accordingly
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

	function applyFunctor(v) {
		if (typeof v === 'number' && fn) {
			return fn(v);
		}

		return v;
	}

	let _initialVal = $state(applyFunctor(getProp(name, props)));

	let _decimals = $derived((() => {
		const s = String(_step);
		const dot = s.indexOf('.');
		return dot === -1 ? 0 : s.length - dot - 1;
	})());

	function formatVal(v: any): string {
		if (typeof v === 'number' && _decimals > 0) {
			return v.toFixed(_decimals);
		}
		return String(v ?? '');
	}

	// Detect units from initial value if not provided
	if (units === null && typeof _initialVal === 'string') {
		const possibleUnits = unitOpts.filter((e) => {
			return _initialVal.endsWith(e);
		});

		// Take the longest match
		const u = possibleUnits.reduce((a, e) => {
			return e.length > (a ?? '').length ? e : a;
		}, null);

		if (u) {
			units = u;
			_initialVal = _initialVal.slice(0, -u.length);
		} else if (!isNaN(parseFloat(_initialVal))) {
			// If it's a number but string, assume px if checking for font size?
			// Or just default to px generally?
			units = 'px';
		}
	} else if (units) {
		// If units provided, strip them from initial value
		if (typeof _initialVal === 'string' && _initialVal.endsWith(units)) {
			_initialVal = _initialVal.slice(0, -units.length);
		}
	}

	let res = extraOpts.find((e) => {
		return e.value === _initialVal || '' + e.value === _initialVal;
	});

	if (res) {
		_props._override = res.value;
	} else {
		_props._override = optDefault;
	}
</script>

<div class="gym-control">
	<span class="gym-label"><GymInterpolateMenu
		bind:this={interpMenu}
		mode="slider"
		sliderMin={min ?? 0}
		sliderMax={max ?? 100}
		sliderValue={_initialVal}
		{units}
		propName={name}
		bind:props
	/>{label ?? name}</span>
	<div class="gym-value">
		<span class="value-indicator">{#if _props._override !== optDefault}{extraOpts.find(e => e.value === _props._override)?.label ?? ''}{:else}{formatVal(_initialVal)}{typeof _initialVal === 'number' || (typeof _initialVal === 'string' && !isNaN(Number(_initialVal))) ? (units ?? '') : ''}{/if}</span>
		<input
			type="range"
			min={min ?? 0}
			max={max ?? 100}
			step={_step}
			on:input={(e) => {
				_props._override = optDefault;
				setProp(applyFunctor(+e.target.value), name, props, units);
			}}
			bind:value={_initialVal}
		/>
	</div>
	{#if !hideExtra}
		<div class="gym-overrides">
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_props._override}
				{optDefault}
				onselect={(v) => { _props._override = v; }}
				onclear={() => { _props._override = optDefault; }}
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
