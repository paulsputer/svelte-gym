<script>
	// @ts-nocheck

	import GymRadioGroup from './GymRadioGroup.svelte';
	import { setProp, getProp } from './helpers.js';
	export let props;
	export let name;
	export let min = 0;
	export let max = 100;
	export let units = null;
	export let fn = (v) => v;
	export let label = name;

	export let hideExtra = false;

	const optDefault = 'NONE';

	let _props = {
		_override: optDefault
	};

	$: {
		let v = _props._override;

		if (v !== optDefault) {
			if (v === 'NaN') {
				// Force as Number.NaN
				v = +v;
			}
			setProp(v, name, props, units);
		}

		props = props;
	}

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
		if (typeof v === 'number') {
			return fn(v);
		}

		return v;
	}

	let _initialVal = applyFunctor(getProp(name, props));

	if (Number.isNaN(+_initialVal)) {
		// Could be due to units
		const possibleUnits = unitOpts.filter((e) => {
			return _initialVal.indexOf(e) > 0;
		});

		// Take the largest if multiple
		const u = possibleUnits.reduce((a, e) => {
			e.length > (a ?? '').length;
			return e;
		}, null);

		if (u) {
			// Override the units so the control makes sense
			units = u;
			_initialVal = _initialVal.slice(0, -u.length);
		}
	}

	let res = extraOpts.filter((e) => {
		if (e.value === _initialVal || '' + e.value === _initialVal) {
			return true;
		}
	});

	if (res.length > 0) {
		_props._override = res[0].value;
	} else {
		_props._override = optDefault;
	}
</script>

<div class="holder">
	<label>
		<input
			type="range"
			{min}
			{max}
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
