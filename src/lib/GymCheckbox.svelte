<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	interface GymCheckboxProps {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		props: Record<string, any>;
		name: string;
		label?: string;
		hideExtra?: boolean;
	}

	let { props = $bindable(), name, label = name, hideExtra = false }: GymCheckboxProps = $props();

	const optDefault = 'NONE';

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	let _initialVal = $state(false);

	// Synchronous initial setup for SSR and immediate hydration
	(() => {
		let v = getProp(name, props);
		if (v === 'true' || v === 1) {
			setProp(true, name, props);
		} else if (v === 'false' || v === 0) {
			setProp(false, name, props);
		}
	})();

	$effect(() => {
		let v = getProp(name, props);

		// Coerce to bool
		if (v === 'true' || v === 1) {
			v = true;
			setProp(true, name, props);
		} else if (v === 'false' || v === 0) {
			v = false;
			setProp(false, name, props);
		}

		// Coerce to bool
		if (v === 'true' || v === 1) {
			v = true;
			setProp(true, name, props);
		} else if (v === 'false' || v === 0) {
			v = false;
			setProp(false, name, props);
		}

		let res = extraOpts.filter((e) => {
			return e.value === v || '' + e.value === String(v);
		});

		if (res.length > 0) {
			_initialVal = false;
		} else {
			_initialVal = v as boolean;
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

{#if hideExtra}
	<div class="gym-control gym-inline">
		<label>
			<input
				type="checkbox"
				checked={_initialVal}
				oninput={(e) => {
					setProp((e.target as HTMLInputElement).checked, name, props);
				}}
			/>
			<span>{label ?? name}</span>
		</label>
	</div>
{:else}
	<div class="gym-control">
		<span class="gym-label">{label ?? name}</span>
		<div class="gym-value-row">
			<label>
				<input
					type="checkbox"
					checked={_initialVal}
					oninput={(e) => {
						setProp((e.target as HTMLInputElement).checked, name, props);
					}}
				/>
			</label>
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_override}
				{optDefault}
				onselect={(v: string | number | boolean | null | undefined) => {
					setProp(v, name, props);
				}}
				onclear={() => {
					setProp(false, name, props);
				}}
			/>
		</div>
	</div>
{/if}

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

	.gym-value-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.15em 0;
	}

	.gym-inline label {
		display: flex;
		align-items: center;
		gap: 0.4em;
		cursor: pointer;
		color: #000;
		text-transform: capitalize;
		font-weight: 600;
	}

	input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: #333;
	}
</style>
