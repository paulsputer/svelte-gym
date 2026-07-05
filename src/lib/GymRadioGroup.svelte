<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	interface GymRadioGroupProps {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		props: Record<string, any>;
		name: string;
		label?: string;
		excludeFromPermalink?: boolean;
		hideExtra?: boolean;
		options?: Array<{ label: string; value: unknown }> | string[];
	}

	let {
		props = $bindable(),
		name,
		label = name,
		excludeFromPermalink = false,
		hideExtra = false,
		options = []
	}: GymRadioGroupProps = $props();

	let _options = $derived.by(() => {
		if (Array.isArray(options) && options.length > 0) {
			if (typeof options[0] === 'string') {
				return (options as string[]).map((e) => ({ label: e, value: e }));
			}
			return options as Array<{ label: string; value: unknown }>;
		}
		return [];
	});

	const optDefault = 'NONE';

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

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

	let _counter = 0;
	const groupId = `gym-radio-${_counter++}-${Date.now()}`;
</script>

<div class="gym-control">
	<span class="gym-label">{label ?? name}</span>
	<div class="gym-value">
		{#each _options as opt}
			<label class="radio-label">
				<input
					type="radio"
					name={groupId}
					onchange={(e) => {
						props[name] = (e.target as HTMLInputElement).value;

						if (!(excludeFromPermalink ?? false) && typeof window !== 'undefined') {
							const url = new URL(window.location.href);
							url.searchParams.set(name, props[name]);
							history.replaceState(null, '', url);
						}
					}}
					bind:group={props[name]}
					value={opt.value}
				/>
				<span>{opt.label}</span>
			</label>
		{/each}
	</div>
	{#if !hideExtra}
		<div class="gym-overrides">
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_override}
				{optDefault}
				onselect={(v: string | number | boolean | null | undefined) => {
					setProp(v, name, props, undefined, excludeFromPermalink);
				}}
				onclear={() => {
					setProp(
						_options.length > 0
							? (_options[0].value as string | number | boolean | null | undefined)
							: false,
						name,
						props,
						undefined,
						excludeFromPermalink
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

	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.4em;
		color: #000;
		padding: 0.1em 0;
		cursor: pointer;
	}

	input[type='radio'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: #333;
	}
</style>
