<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';
	import GymInterpolateMenu from './GymInterpolateMenu.svelte';

	interface GymTextboxProps {
		props: Record<string, any>;
		name: string;
		label?: string;
		hideExtra?: boolean;
		multiline?: boolean;
		interpMenu?: GymInterpolateMenu;
	}

	let { props = $bindable(), name, label = name, hideExtra = false, multiline = false, interpMenu = $bindable() }: GymTextboxProps = $props();

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

	// React to external prop changes (e.g. from interpolation)
	$effect(() => {
		const currentVal = getProp(name, props);
		if (_props._override === optDefault && currentVal !== _initialVal) {
			_initialVal = currentVal ?? '';
		}
	});
</script>

<div class="gym-control">
	<span class="gym-label"><GymInterpolateMenu
		bind:this={interpMenu}
		mode="text"
		{multiline}
		propName={name}
		bind:props
	/>{label ?? name}</span>
	<div class="gym-value">
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
