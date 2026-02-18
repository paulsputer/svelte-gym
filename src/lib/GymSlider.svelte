<script lang="ts">
	// @ts-nocheck

	import GymRadioGroup from './GymRadioGroup.svelte';
	import { setProp, getProp } from './helpers.js';

	let {
		props = $bindable(),
		name,
		min = null,
		max = null,
		step = null,
		units = null,
		fn = null,
		label = name,
		hideExtra = false
	} = $props();

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
						max = window.innerWidth;
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

<div class="holder">
	<label>
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
		<span>{label ?? name}</span>
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
		padding: 0.5em 1em;
	}

	.holder label {
		color: #000;
	}

	label span {
		text-transform: capitalize;
	}
</style>
