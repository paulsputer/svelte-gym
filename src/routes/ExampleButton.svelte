<script lang="ts">
	import { Wave } from 'svelte-loading-spinners';
	export let onclick: () => void;
	export let label = '';
	export let active = true;
	export let spinner = false;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="button" on:click={() => onclick && onclick()} class:active class:spinner>
	<div class="spinner-holder">
		<Wave size="1" unit="em" color="var(--foreground-color)" />
	</div>

	<div>
		{#if $$slots.icon}
			<slot name="icon" />
		{/if}
		<div class="label-holder">
			{label ?? '~'}
		</div>
	</div>
</div>

<style>
	:root {
		--primary-inactive: green;
	}
	.button {
		/* CSS variable scenarios for testing extractor */
		--unused-variable: 42px;
		--another-unused: oklch(0.5 0.2 200);

		--background-color: var(--primary-inactive);
		--foreground-color: var(--primary);
		--fade-time: 500ms;

		font-family: sans-serif;
		position: relative;
		min-width: 10em;
		border-radius: var(--custom-radius, 0.5em);
		box-shadow: var(--shadow-offset-x, 2px) var(--shadow-offset-y, 2px) var(--shadow-blur, 10px)
			var(--shadow-color, rgba(0, 0, 0, 0.2));
		transform: scale(var(--scale-factor, 1));
		line-height: 3em;
		text-align: center;
		text-transform: uppercase;
		color: var(--foreground-color);
		border: 1px solid var(--border-color, var(--primary));
		background-color: var(--background-color);
		/* Prevent the button from popping out of it's parent horizontally */
		min-width: 0;
	}

	.button:hover {
		cursor: pointer;
	}

	.button:focus {
		outline: solid 2px #000;
	}

	.spinner-holder {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 0;
		transition: opacity var(--fade-time) ease-in-out;
		--test: 42;
	}

	.button .label-holder {
		padding: 0 32px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		opacity: 1;
		transition: opacity var(--fade-time) ease-in-out;
	}

	.spinner.button .spinner-holder {
		opacity: 1;
	}
	.spinner.button .label-holder {
		opacity: 0;
	}

	.active.button {
		--background-color: var(--primary);
		--foreground-color: var(--primary-inverted);
	}
</style>
