<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	interface GymDropdownProps {
		props: Record<string, any>;
		name: string;
		options: any[] | Record<string, any>;
		label?: string;
		hideExtra?: boolean;
		optLabel?: string;
		optValue?: string;
	}

	let {
		props = $bindable(),
		name,
		options,
		label = name,
		hideExtra = false,
		optLabel = 'label',
		optValue = 'value'
	}: GymDropdownProps = $props();

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

<div class="gym-control">
	<span class="gym-label">{label ?? name}</span>
	<div class="gym-value">
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

	select {
		background-color: #fff;
		width: 100%;
		box-sizing: border-box;
	}
</style>
