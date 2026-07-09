<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';
	import GymInterpolateMenu from './GymInterpolateMenu.svelte';

	interface GymTextboxProps {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		props: Record<string, any>;
		name: string;
		label?: string;
		hideExtra?: boolean;
		multiline?: boolean;
		interpMenu?: GymInterpolateMenu;
		subLabel?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		fallback?: any;
	}

	let {
		props = $bindable(),
		name,
		label = name,
		hideExtra = false,
		multiline = false,
		interpMenu = $bindable(),
		subLabel = undefined,
		fallback = undefined
	}: GymTextboxProps = $props();

	const optDefault = 'NONE';

	const extraOpts = [{ label: 'null', value: null }];

	let _initialVal = $state('');
	let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined = $state();
	let isMenuOpen = $state(false);

	$effect(() => {
		let v = getProp(name, props);

		let res = extraOpts.filter((e) => {
			return e.value === v || '' + e.value === String(v);
		});

		if (res.length > 0) {
			_initialVal = '';
		} else {
			// If the user is currently typing in this exact input, do not forcefully overwrite the value
			// as it will break their cursor position due to reactivity race conditions.
			if (document.activeElement !== inputRef) {
				_initialVal = v ?? '';
			}
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
	<span class="gym-label"
		><GymInterpolateMenu
			bind:this={interpMenu}
			bind:open={isMenuOpen}
			mode="text"
			{multiline}
			propName={name}
			bind:props
		/>{label ?? name}</span
	>
	{#if subLabel}
		<div class="gym-sublabel" title={subLabel}>{subLabel}</div>
	{/if}
	<div class="gym-value">
		{#if multiline}
			<textarea
				class:highlight-active={isMenuOpen}
				bind:this={inputRef}
				bind:value={_initialVal}
				placeholder={fallback ?? ''}
				oninput={(e) => {
					setProp((e.target as HTMLTextAreaElement).value, name, props);
				}}
			></textarea>
		{:else}
			<input
				class:highlight-active={isMenuOpen}
				bind:this={inputRef}
				type="text"
				bind:value={_initialVal}
				placeholder={fallback ?? ''}
				oninput={(e) => {
					setProp((e.target as HTMLInputElement).value, name, props);
				}}
			/>
		{/if}
	</div>
	{#if !hideExtra}
		<div class="gym-overrides">
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_override}
				{optDefault}
				onselect={(v: string | number | boolean | null | undefined) => {
					setProp(v, name, props);
				}}
				onclear={() => {
					setProp('', name, props);
				}}
			/>
		</div>
	{/if}
</div>

<style>
	.gym-control {
		padding: 0.4em 0.75em;
		position: relative;
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

	.gym-sublabel {
		font-size: 0.65rem;
		color: #888;
		margin-top: -0.25em;
		margin-bottom: 0.4em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-family: monospace;
	}

	.gym-value input {
		width: 100%;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: #fff;
		padding: 4px;
		font-family: monospace;
	}

	textarea {
		min-height: 100px;
		resize: vertical;
	}

	.highlight-active {
		outline: 2px solid #e65100;
		outline-offset: -1px;
	}
</style>
