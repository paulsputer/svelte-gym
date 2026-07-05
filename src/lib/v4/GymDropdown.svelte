<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	export let props: Record<string, any>;
	export let name: string;
	export let options: any[] | Record<string, any>;
	export let label: string | undefined = undefined;
	export let hideExtra: boolean = false;
	export let optLabel: string = 'label';
	export let optValue: string = 'value';

	$: _label = label ?? name;

	$: _options = (() => {
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
	})();

	const optDefault = 'NONE';
	let _props = {
		_override: optDefault
	};

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	let _initialVal = getProp(name, props);

	$: res = extraOpts.filter((e) => {
		if (e.value === _initialVal || '' + e.value === _initialVal) {
			return true;
		}
	});

	$: {
		if (res.length > 0) {
			_props._override = res[0].value as string;
		} else {
			_props._override = optDefault;
		}
	}

	function handleSelect(v: string) {
		_props._override = v;
		setProp(v, name, props, undefined, undefined);
		props = props;
	}

	function handleClear() {
		_props._override = optDefault;
		setProp(_initialVal, name, props, undefined, undefined);
		props = props;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLSelectElement;
		_initialVal = target.value;
		_props._override = optDefault;
		setProp(target.value, name, props);
		props = props;
	}
</script>

<div class="gym-control">
	<span class="gym-label">{_label}</span>
	<div class="gym-value">
		<select class="gym-dropdown" bind:value={_initialVal} on:input={handleInput}>
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
				onselect={handleSelect}
				onclear={handleClear}
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
