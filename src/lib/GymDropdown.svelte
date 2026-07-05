<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	interface GymDropdownProps {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		props: Record<string, any>;
		name: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let _initialVal: any = $state(false);

	$effect(() => {
		let v = getProp(name, props);

		let res = extraOpts.filter((e) => {
			return e.value === v || '' + e.value === String(v);
		});

		if (res.length > 0) {
			_initialVal = false;
		} else {
			_initialVal = v;
		}
	});

	let _override = $derived.by(() => {
		let v = getProp(name, props);
		let res = extraOpts.filter((e) => {
			return e.value === v || '' + e.value === String(v);
		});
		if (res.length > 0) {
			return res[0].value as string;
		}
		return optDefault;
	});
</script>

<div class="gym-control">
	<span class="gym-label">{label ?? name}</span>
	<div class="gym-value">
		<select
			bind:value={_initialVal}
			oninput={(e) => {
				setProp((e.target as HTMLSelectElement).value, name, props, undefined, undefined);
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
				activeValue={_override}
				{optDefault}
				onselect={(v: string | number | boolean | null | undefined) => {
					setProp(v, name, props, undefined, undefined);
				}}
				onclear={() => {
					setProp(
						_options.length > 0 ? _options[0].value : false,
						name,
						props,
						undefined,
						undefined
					);
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

	select {
		background-color: #fff;
		width: 100%;
		box-sizing: border-box;
	}
</style>
