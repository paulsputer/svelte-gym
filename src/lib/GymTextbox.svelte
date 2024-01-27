<script>
	// @ts-nocheck
	import { setProp, getProp } from './helpers.js';
	import GymRadioGroup from './GymRadioGroup.svelte';

	export let props;
	export let name;
	export let label = name;
	export let hideExtra = false;

	const optDefault = 'NONE';

	let _props = {
		_override: optDefault
	};

	$: {
		let v = _props._override;

		if (v !== optDefault) {
			_initialVal = '';
			setProp(v, name, props);
		}

		props = props;
	}

	const extraOpts = [
		// NOTE: Important to define NaN as a string else comparison won't work
		// and radio buttons will not activate accordingly
		{ label: 'null', value: null },
		{ label: 'undefined', value: undefined }
	];

	let _initialVal = getProp(name, props);
	let res = extraOpts.filter((e) => {
		if (e.value === _initialVal || '' + e.value === _initialVal) {
			return true;
		}
	});

	if (res.length > 0) {
		_props._override = res[0].value;
		_initialVal = '';
	} else {
		_props._override = optDefault;
	}
</script>

<div class="holder">
	<label>
		<div>{label ?? name}</div>
		<input
			type="text"
			bind:value={_initialVal}
			on:input={(e) => {
				_props._override = optDefault;
				setProp(e.target.value, name, props);
			}}
		/>
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
		padding: 0 1em;
	}

	.holder label {
		color: #000;
	}

	label div {
		text-transform: capitalize;
		font-weight: 600;
		padding-top: 0.5em;
	}

	input {
		background-color: #fff;
	}
</style>
