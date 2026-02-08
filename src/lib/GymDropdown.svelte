<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymRadioGroup from './GymRadioGroup.svelte';

	let {
		props = $bindable(),
		name,
		options,
		label = name,
		hideExtra = false,
		optLabel = 'label',
		optValue = 'value'
	} = $props();

	let _options = $derived.by(() => {
		if (Array.isArray(options) && options.length > 0) {
			if (typeof options[0] === 'string') {
				return options.map((e) => {
					return { label: e, value: e };
				});
			} else {
				return options.map((e) => {
					return { label: e[optLabel], value: e[optValue] };
				});
			}
		} else if (typeof options === 'object') {
			return Object.values(options).map((e) => {
				return { label: e, value: e };
			});
		}
		return [];
	});

	const optDefault = 'NONE';
	let _props = $state({
		_override: optDefault
	});

	$effect(() => {
		let v = _props._override;

		if (v !== optDefault) {
			_initialVal = false;
			setProp(v, name, props, undefined, undefined);
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
		_initialVal = false;
	} else {
		_props._override = optDefault;
	}
</script>

<div class="holder">
	<label>
		<span>{label ?? name}</span>
		<select
			bind:value={_initialVal}
			on:input={(e) => {
				_props._override = optDefault;
				// @ts-ignore
				setProp(e.target.value, name, props, undefined, undefined);
			}}
		>
			{#each _options as opt}
				<option value={opt.value}>
					{opt.label}
				</option>
			{/each}
		</select>
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

	label span {
		text-transform: capitalize;
		font-weight: 600;
		padding-top: 0.5em;
	}

	select {
		background-color: #fff;
	}
</style>
