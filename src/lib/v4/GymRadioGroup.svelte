<script lang="ts">
	import { setProp, getProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	export let props: Record<string, any>;
	export let name: string;
	export let label: string | undefined = undefined;
	export let excludeFromPermalink: boolean = false;
	export let hideExtra: boolean = false;
	export let options: Array<{ label: string; value: any }> | string[] = [];

	$: _label = label ?? name;

	$: _options = (() => {
		if (Array.isArray(options) && options.length > 0) {
			if (typeof options[0] === 'string') {
				return (options as string[]).map((e) => ({ label: e, value: e }));
			}
			return options as Array<{ label: string; value: any }>;
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
		setProp(v, name, props, undefined, excludeFromPermalink);
		props = props;
	}

	function handleClear() {
		_props._override = optDefault;
		setProp(_initialVal, name, props, undefined, excludeFromPermalink);
		props = props;
	}

	let _counter = 0;
	const groupId = `gym-radio-${_counter++}-${Date.now()}`;

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		_props._override = optDefault;
		props[name] = target.value;
		setProp(target.value, name, props, undefined, excludeFromPermalink);

		if (!(excludeFromPermalink ?? false) && typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			url.searchParams.set(name, props[name]);
			history.replaceState(null, '', url);
		}
		props = props;
	}
</script>

<div class="gym-control">
	<span class="gym-label">{_label}</span>
	<div class="gym-value">
		{#each _options as opt}
			<label class="radio-label">
				<input
					type="radio"
					name={groupId}
					on:change={handleChange}
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
