<script>
	// @ts-nocheck
	import { setProp, getProp } from './helpers.js';
	import GymRadioGroup from './GymRadioGroup.svelte';

	let { props = $bindable(), name, label = name, hideExtra = false } = $props();

	const optDefault = 'NONE';

	let _props = $state({
		_override: optDefault
	});

	$effect(() => {
		let v = _props._override;

		if (v !== optDefault) {
			_initialVal = false;
			setProp(v, name, props);
		}
	});

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	let _initialVal = $state(getProp(name, props));

	// Coerce to bool
	if (_initialVal === 'true' || _initialVal === 1) {
		_initialVal = true;
		setProp(true, name, props);
	} else if (_initialVal === 'false' || _initialVal === 0) {
		_initialVal = false;
		setProp(false, name, props);
	}

	let res = extraOpts.filter((e) => {
		if (e.value === _initialVal || '' + e.value === _initialVal) {
			return true;
		}
	});

	if (res.length > 0) {
		_props._override = res[0].value;
		_initialVal = false;
	} else {
		_props._override = optDefault;
	}
</script>

<div class="holder">
	<label>
		<input
			type="checkbox"
			checked={_initialVal}
			on:input={(e) => {
				_props._override = optDefault;
				setProp(e.target.checked, name, props);
			}}
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
		margin: 0 0.5em 0 0;
		user-select: none;
		cursor: pointer;
	}

	.holder label {
		color: #000;
	}
</style>
