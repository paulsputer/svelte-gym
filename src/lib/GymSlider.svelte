<script lang="ts">
	import GymOverrideButtons from './GymOverrideButtons.svelte';
	import GymInterpolateMenu from './GymInterpolateMenu.svelte';
	import { setProp, getProp } from './helpers.js';
	import { untrack } from 'svelte';

	interface GymSliderProps {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let _initialVal: any = $state(0);
	let _step = $derived(step ?? 1);

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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function applyFunctor(v: any) {
		if (typeof v === 'number' && fn) {
			return fn(v);
		}

		return v;
	}

	// Synchronous initial setup for SSR and immediate hydration
	(() => {
		let rawPropVal = applyFunctor(getProp(name, props));

		if (units === null && typeof rawPropVal === 'string') {
			const possibleUnits = unitOpts.filter((e) => {
				return rawPropVal.endsWith(e);
			});
			const u = possibleUnits.reduce((a: string | null, e) => {
				return e.length > (a ?? '').length ? e : a;
			}, null);
			if (u) {
				units = u;
				rawPropVal = rawPropVal.slice(0, -u.length);
			}
		} else if (units) {
			if (typeof rawPropVal === 'string' && rawPropVal.endsWith(units)) {
				rawPropVal = rawPropVal.slice(0, -units.length);
			}
		}

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

		if (step === null) {
			switch (units) {
				case 'em':
				case 'rem':
				case 'vw':
				case 'vh':
				case 'svh':
				case 'dvh':
				case 'lvh':
					step = 0.1;
					break;
				default:
					step = 1;
					break;
			}
		}

		_step = step ?? 1;

		if (typeof rawPropVal === 'string') {
			const num = parseFloat(rawPropVal);
			if (!isNaN(num)) {
				const prec = _step < 1 ? 10 : 1;
				rawPropVal = Math.round(num * prec) / prec;
			}
		}

		let res = extraOpts.find((e) => {
			return e.value === rawPropVal || '' + e.value === String(rawPropVal);
		});

		if (!res) {
			_initialVal = rawPropVal;
		}
	})();

	$effect(() => {
		// 1. Sync from props to local state
		let rawPropVal = applyFunctor(getProp(name, props));

		if (units === null && typeof rawPropVal === 'string') {
			const possibleUnits = unitOpts.filter((e) => rawPropVal.endsWith(e));
			const u = possibleUnits.reduce(
				(a: string | null, e) => (e.length > (a ?? '').length ? e : a),
				null
			);
			if (u) {
				units = u;
				rawPropVal = rawPropVal.slice(0, -u.length);
			}
		} else if (units && typeof rawPropVal === 'string' && rawPropVal.endsWith(units)) {
			rawPropVal = rawPropVal.slice(0, -units.length);
		}

		let currentVal = rawPropVal;
		if (typeof currentVal === 'string') {
			const num = parseFloat(currentVal);
			if (!isNaN(num)) {
				const prec = _step < 1 ? 10 : 1;
				currentVal = Math.round(num * prec) / prec;
			}
		}

		let res = extraOpts.find((e) => e.value === currentVal || '' + e.value === String(currentVal));

		untrack(() => {
			if (!res && currentVal != _initialVal) {
				console.log(`[GymSlider ${name}] Syncing props -> local:`, currentVal);
				_initialVal = currentVal;
			}
		});
	});

	// Sync local state (_initialVal) to props
	$effect(() => {
		const numVal = Number(_initialVal);
		console.log(
			`[GymSlider ${name}] Syncing local -> props. _initialVal =`,
			_initialVal,
			'numVal =',
			numVal
		);
		untrack(() => {
			let currentPropVal = applyFunctor(getProp(name, props));
			if (units && typeof currentPropVal === 'string' && currentPropVal.endsWith(units)) {
				const num = parseFloat(currentPropVal.slice(0, -units.length));
				if (!isNaN(num)) {
					currentPropVal = num;
				}
			}

			if (!isNaN(numVal) && currentPropVal !== numVal) {
				console.log(`[GymSlider ${name}] Calling setProp for numVal =`, numVal);
				setProp(applyFunctor(numVal), name, props, units ?? undefined);
			}
		});
	});

	let _override = $derived.by(() => {
		let v = getProp(name, props);

		if (units !== null && typeof v === 'string' && v.endsWith(units)) {
			v = v.slice(0, -units.length);
		}

		let res = extraOpts.find((e) => {
			return e.value === v || '' + e.value === String(v);
		});

		if (res) {
			return res.value as string;
		}

		return optDefault;
	});

	let _decimals = $derived(
		(() => {
			const s = String(_step);
			const dot = s.indexOf('.');
			return dot === -1 ? 0 : s.length - dot - 1;
		})()
	);

	function formatVal(v: unknown): string {
		if (typeof v === 'number' && _decimals > 0) {
			return v.toFixed(_decimals);
		}
		return String(v ?? '');
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
		/>{label ?? name}</span
	>
	<div class="gym-value">
		<span class="value-indicator"
			>{#if _override !== optDefault}{extraOpts.find((e) => e.value === _override)?.label ??
					''}{:else}{formatVal(_initialVal)}{typeof _initialVal === 'number' ||
				(typeof _initialVal === 'string' && !isNaN(Number(_initialVal)))
					? (units ?? '')
					: ''}{/if}</span
		>
		<input type="range" min={min ?? 0} max={max ?? 100} step={_step} bind:value={_initialVal} />
	</div>
	{#if !hideExtra}
		<div class="gym-overrides">
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_override}
				{optDefault}
				onselect={(v: string | number | boolean | null | undefined) => {
					let finalV = v;
					if (v === 'NaN') finalV = Number.NaN;
					setProp(finalV, name, props, units ?? undefined);
				}}
				onclear={() => {
					setProp(applyFunctor(_initialVal), name, props, units ?? undefined);
				}}
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
