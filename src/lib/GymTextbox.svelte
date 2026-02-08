<script>
	// @ts-nocheck
	import { setProp, getProp } from './helpers.js';
	import GymRadioGroup from './GymRadioGroup.svelte';

	let { props = $bindable(), name, label = name, hideExtra = false, multiline = false } = $props();

	const optDefault = 'NONE';

	let _props = $state({
		_override: optDefault
	});

	$effect(() => {
		let v = _props._override;

		if (v !== optDefault) {
			_initialVal = '';
			setProp(v, name, props);
		}
	});

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	let _initialVal = $state(getProp(name, props));
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
		{#if multiline}
			<textarea
				bind:value={_initialVal}
				on:input={(e) => {
					_props._override = optDefault;
					setProp(e.target.value, name, props);
				}}
			></textarea>
		{:else}
			<input
				type="text"
				bind:value={_initialVal}
				on:input={(e) => {
					_props._override = optDefault;
					setProp(e.target.value, name, props);
				}}
			/>
		{/if}
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

	input,
	textarea {
		background-color: #fff;
		width: 100%;
		box-sizing: border-box;
	}

	textarea {
		min-height: 100px;
		resize: vertical;
	}
</style>
