<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	interface GymCheckboxProps {
		props: Record<string, any>;
		name: string;
		label?: string;
		hideExtra?: boolean;
	}

	let { props = $bindable(), name, label = name, hideExtra = false }: GymCheckboxProps = $props();

	const optDefault = 'NONE';

	let _props = $state({
		_override: optDefault
	});

	$effect(() => {
		let v = _props._override;

		if (v !== optDefault) {
			_initialVal = false;
			setProp(v, name, props);
		}
	});

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	let _initialVal = $state(getProp(name, props));

	// Coerce to bool
	if (_initialVal === 'true' || _initialVal === 1) {
		_initialVal = true;
		setProp(true, name, props);
	} else if (_initialVal === 'false' || _initialVal === 0) {
		_initialVal = false;
		setProp(false, name, props);
	}

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

{#if hideExtra}
	<div class="gym-control gym-inline">
		<label>
			<input
				type="checkbox"
				checked={_initialVal}
				on:input={(e) => {
					_props._override = optDefault;
					setProp(e.target.checked, name, props);
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
					on:input={(e) => {
						_props._override = optDefault;
						setProp(e.target.checked, name, props);
					}}
				/>
			</label>
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_props._override}
				{optDefault}
				onselect={(v) => { _props._override = v; }}
				onclear={() => { _props._override = optDefault; }}
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
