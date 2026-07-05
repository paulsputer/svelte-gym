<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	export let props: Record<string, any>;
	export let name: string;
	export let label: string | undefined = undefined;
	export let hideExtra: boolean = false;

	$: _label = label ?? name;

	const optDefault = 'NONE';

	let _props = {
		_override: optDefault
	};

	const extraOpts = [
		{ label: 'null', value: null },
		{ label: 'undefined', value: 'undefined' }
	];

	let _initialVal: boolean;

	// Keep _initialVal in sync with props changes from the outside
	$: {
		let v = getProp(name, props);
		if (v === 'true' || v === 1) v = true;
		if (v === 'false' || v === 0) v = false;

		if (_initialVal !== v) {
			_initialVal = v;
			// Coerce to bool in props and propagate back via bind:
			if (v === true || v === false) {
				setProp(v, name, props);
				props = props;
			}
		}
	}

	$: res = extraOpts.filter((e) => {
		if ((e.value as any) === _initialVal || '' + e.value === String(_initialVal)) {
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
		setProp(v, name, props);
		props = props;
	}

	function handleClear() {
		_props._override = optDefault;
		setProp(_initialVal, name, props);
		props = props;
	}

	function handleInput(e: Event) {
		_props._override = optDefault;
		const target = e.target as HTMLInputElement;
		_initialVal = target.checked;
		setProp(target.checked, name, props);
		props = props;
	}
</script>

{#if hideExtra}
	<div class="gym-control gym-inline">
		<label>
			<input type="checkbox" checked={_initialVal} on:input={handleInput} />
			<span>{_label}</span>
		</label>
	</div>
{:else}
	<div class="gym-control">
		<span class="gym-label">{_label}</span>
		<div class="gym-value-row">
			<label>
				<input type="checkbox" checked={_initialVal} on:input={handleInput} />
			</label>
			<GymOverrideButtons
				options={extraOpts}
				activeValue={_props._override}
				{optDefault}
				onselect={handleSelect}
				onclear={handleClear}
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
