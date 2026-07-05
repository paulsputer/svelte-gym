<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';
	import GymInterpolateMenu from './GymInterpolateMenu.svelte';

	export let props: Record<string, any>;
	export let name: string;
	export let label: string | undefined = undefined;
	export let hideExtra: boolean = false;
	export let multiline: boolean = false;
	export let interpMenu: GymInterpolateMenu | undefined = undefined;

	$: _label = label ?? name;

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

	let inputRef: HTMLInputElement | HTMLTextAreaElement;

	// React to external prop changes (e.g. from interpolation)
	$: {
		const currentVal = getProp(name, props);

		// If the user is currently typing in this exact input, do not forcefully overwrite the value
		if (typeof document !== 'undefined' && document.activeElement !== inputRef) {
			if (currentVal !== _initialVal) {
				_initialVal = currentVal ?? '';
			}
		}
	}

	function handleSelect(v: string) {
		_props._override = v;
		setProp(v, name, props);
		props = props;
	}

	function handleClear() {
		_props._override = optDefault;
		setProp(_initialVal, name, props);
		props = props;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		_props._override = optDefault;
		setProp(target.value, name, props);
		props = props;
	}
</script>

<div class="gym-control">
	<span class="gym-label"
		><GymInterpolateMenu
			bind:this={interpMenu}
			mode="text"
			{multiline}
			propName={name}
			bind:props
		/>{_label}</span
	>
	<div class="gym-value">
		{#if multiline}
			<textarea bind:this={inputRef} bind:value={_initialVal} on:input={handleInput}></textarea>
		{:else}
			<input bind:this={inputRef} type="text" bind:value={_initialVal} on:input={handleInput} />
		{/if}
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
