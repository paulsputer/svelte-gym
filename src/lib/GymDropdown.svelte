<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymRadioGroup from './GymRadioGroup.svelte';
	export let props: object;
	export let name: string;
	export let options: object[] | string[] | object;
	export let label: string = name;
	export let hideExtra = false;

	export let optLabel = 'label';
	export let optValue = 'value';

	$: {
		if (Array.isArray(options) && options.length > 0) {
			if (typeof options[0] === 'string') {
				_options = options.map((e) => {
					return { label: e, value: e };
				});
			} else {
				_options = options.map((e) => {
					return { label: e[optLabel], value: e[optValue] };
				});
			}
		} else if (typeof options === 'object') {
			_options = Object.values(options).map((e) => {
				return { label: e, value: e };
			});
		}
	}

	const optDefault = 'NONE';

	let _props = {
		_override: optDefault
	};

	$: {
		let v = _props._override;

		if (v !== optDefault) {
			_initialVal = false;
			setProp(v, name, props);
		}

		props = props;
	}

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	let _options: { label: string; value: string }[] = [];

	let _initialVal = getProp(name, props);

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
				setProp(e.target.value, name, props);
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
