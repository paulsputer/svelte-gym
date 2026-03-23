<script lang="ts">
	import { restoreProps } from './helpers.js';
	import { onMount, type Snippet } from 'svelte';

	import GymCheckbox from './GymCheckbox.svelte';
	import GymSlider from './GymSlider.svelte';
	import GymButton from './GymButton.svelte';
	import GymDropdown from './GymDropdown.svelte';

	interface TestHarnessProps {
		maxWidth?: number | null;
		maxHeight?: number | null;
		maxFontSize?: number | null;
		componentToTest?: Snippet;
		controls?: Snippet;
		children?: Snippet;
	}

	let {
		maxWidth = null,
		maxHeight = null,
		maxFontSize = null,
		componentToTest,
		controls,
		children
	}: TestHarnessProps = $props();

	let props = $state({
		__controls: true,
		__grid: '20-grid-light-mode',
		__highlight: true,
		__scrollMode: false,
		__width: 'auto',
		__height: 'auto',
		__fontsize: '1em',
		__resetAnimations: () => {},
		__scrollY: undefined as string | undefined
	});

	let scrollMode = $derived(props.__scrollY != null);

	// Sync __scrollMode checkbox with __scrollY
	$effect(() => {
		if (props.__scrollMode && props.__scrollY === undefined) {
			props.__scrollY = (typeof window !== 'undefined' ? window.scrollY : 0) + 'px';
		} else if (!props.__scrollMode && props.__scrollY !== undefined) {
			props.__scrollY = undefined;
		}
	});

	const gridOptions = [
		{ value: '0-grid-light-mode', class: 'grid bg-0 light-mode' },
		{ value: '10-grid-light-mode', class: 'grid bg-10 light-mode' },
		{ value: '20-grid-light-mode', class: 'grid bg-20 light-mode' },
		{ value: '50-grid-light-mode', class: 'grid bg-50 light-mode' },
		{ value: '100-grid-light-mode', class: 'grid bg-100 light-mode' },

		{ value: '0-grid-dark-mode', class: 'grid bg-0 dark-mode' },
		{ value: '10-grid-dark-mode', class: 'grid bg-10 dark-mode' },
		{ value: '20-grid-dark-mode', class: 'grid bg-20 dark-mode' },
		{ value: '50-grid-dark-mode', class: 'grid bg-50 dark-mode' },
		{ value: '100-grid-dark-mode', class: 'grid bg-100 dark-mode' },

		{ value: '10-text-light-mode', class: 'text bg-10 light-mode' },
		{ value: '20-text-light-mode', class: 'text bg-20 light-mode' },
		{ value: '50-text-light-mode', class: 'text bg-50 light-mode' },
		{ value: '100-text-light-mode', class: 'text bg-100 light-mode' },

		{ value: '10-text-dark-mode', class: 'text bg-10 dark-mode' },
		{ value: '20-text-dark-mode', class: 'text bg-20 dark-mode' },
		{ value: '50-text-dark-mode', class: 'text bg-50 dark-mode' },
		{ value: '100-text-dark-mode', class: 'text bg-100 dark-mode' }
	];

	function getGridClassFromValue(v: string | boolean) {
		// support legacy mode was boolean
		const ov = v;

		if (v === true || v === 'true') {
			v = '20-grid-light-mode';
		} else if (v === false || v === 'false') {
			v = '';
		}

		// support legacy text options map to new items
		switch (v) {
			case 'none': {
				v = '';
				break;
			}
			case 'light': {
				v = '20-grid-light-mode';
				break;
			}
			case 'dark':
				v = '50-grid-light-mode';
				break;
			case 'black':
				v = '100-grid-light-mode';
				break;
			case 'white':
				v = '100-grid-dark-mode';
				break;
			case 'textBlack':
				v = '100-text-light-mode';
				break;
			case 'textWhite':
				v = '100-text-dark-mode';
				break;
		}

		if (ov != v) {
			console.warn(`depreciated option ${ov} use ${v} instead`);
		}
		const g = gridOptions.filter((e) => e.value === v);

		if (g.length > 0) {
			return g[0].class;
		}

		return '';
	}

	let maxScroll = $state(0);

	function updateMaxScroll() {
		maxScroll = Math.max(0, document.body.scrollHeight - window.innerHeight);
	}

	let initialRestoration = true;

	onMount(() => {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}

		let hasAnimations = document.getAnimations().length > 0;
		// @ts-ignore
		props.__resetAnimations = hasAnimations ? resetAnimations : undefined;

		// Track scroll height changes
		updateMaxScroll();

		// Initial scroll restoration
		if (props.__scrollY !== undefined) {
			setTimeout(() => {
				window.scrollTo(0, parseFloat(props.__scrollY as string));
				initialRestoration = false;
			}, 100);
		} else {
			initialRestoration = false;
		}

		const resizeObserver = new ResizeObserver(() => {
			updateMaxScroll();
		});
		resizeObserver.observe(document.body);

		window.addEventListener('resize', updateMaxScroll);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', updateMaxScroll);
		};
	});

	function resetAnimations() {
		console.info('Svelte-Gym: Animations Reset');
		document.getAnimations().forEach((a) => {
			a.cancel();
			a.play();
		});
	}

	let permalinkLabel = $state('Copy Permalink');

	async function copyPermalink(e: Event) {
		e.preventDefault();
		const url = new URL(window.location.href);
		if (props.__scrollY != null) {
			url.searchParams.set('__scrollY', '' + props.__scrollY);
		} else {
			url.searchParams.delete('__scrollY');
		}
		await navigator.clipboard.writeText(url.toString());
		permalinkLabel = 'Copied!';
		setTimeout(() => (permalinkLabel = 'Copy Permalink'), 1500);
	}

	$effect.pre(() => {
		if (typeof window !== 'undefined') {
			restoreProps(props);
		}
	});



	function updateScroll() {
		// Prevent initial 0 from overwriting restored value
		if (initialRestoration && props.__scrollY !== undefined) return;

		const y = window.scrollY;
		if (props.__scrollY !== undefined || y > 0) {
			props.__scrollY = y + 'px';
		}
	}

	$effect(() => {
		if (
			props.__scrollY !== undefined &&
			Math.abs(window.scrollY - parseFloat(props.__scrollY)) > 5
		) {
			window.scrollTo(0, parseFloat(props.__scrollY));
		}
	});
</script>

<svelte:window onscroll={updateScroll} />

<section class={props.__controls ? '' : 'hide-controls'}>
	<div class="test-grid {getGridClassFromValue(props.__grid)}"></div>

	<div class="test-area" class:controls={props.__controls}>
		<div class="test-holder" class:scroll-mode={scrollMode}>
			<div
				class="test-component"
				class:highlight={props.__highlight}
				style="
				--w:{props.__width};
				--h:{props.__height};
				--fs:{props.__fontsize}"
			>
				{#if componentToTest}
					{@render componentToTest()}
				{:else if children}
					{@render children()}
				{/if}
			</div>
		</div>
		<div class="test-controls">
			<span
				><button type="button" class="link-button" onclick={copyPermalink}
					>{permalinkLabel}</button
				></span
			>

			<hr />
			<br />
			<ul>
				<li>
					<GymCheckbox hideExtra={true} bind:props name="__controls" label="controls" />
				</li>
				<li>
					<GymCheckbox hideExtra={true} bind:props name="__scrollMode" label="scroll mode" />
				</li>
				<GymDropdown
					hideExtra={true}
					bind:props
					name="__grid"
					label="grid"
					options={gridOptions}
					optLabel="value"
					optValue="value"
				/>
				<li>
					<GymCheckbox hideExtra={true} bind:props name="__highlight" label="highlight" />
				</li>
			</ul>
			<GymButton bind:props name="__resetAnimations" label="Reset Animations" />

			<br />
			<GymSlider
				hideExtra={true}
				units="px"
				max={maxWidth}
				bind:props
				name="__width"
				label="width"
			/>
			<GymSlider
				hideExtra={true}
				units="px"
				max={maxHeight}
				bind:props
				name="__height"
				label="height"
			/>
			<GymSlider hideExtra={true} max={maxFontSize} bind:props name="__fontsize" label="fontsize" />
			<GymSlider
				hideExtra={true}
				units="px"
				max={maxScroll}
				bind:props
				name="__scrollY"
				label="scrollY"
			/>

			<br />
			<hr />
			<span>
				{#if controls}
					{@render controls()}
				{/if}
			</span>
		</div>
	</div>
</section>

<style>
	:root {
		--control-area-width: 20em;
		--bg-color: #fff;
	}

	section hr {
		border-color: #999;
	}
	.test-controls .link-button {
		background: none;
		border: none;
		padding: 0;
		color: #000;
		text-decoration: underline;
		cursor: pointer;
		font: inherit;
	}

	.test-controls .link-button:hover {
		text-decoration: none;
	}

	.test-grid {
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: -900;
	}

	.test-area {
	}

	.test-area.controls {
		display: block;
		height: 100%;
		width: 100%;
	}

	.test-holder {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		width: 100%;
	}

	.test-holder.scroll-mode {
		align-items: flex-start;
		padding-bottom: 50vh; /* Allow scrolling past simple content */
	}

	.hide-controls .test-holder {
		width: 100%;
		left: 0;
	}

	section {
		min-height: 100vh;
		width: 100vw;
	}

	.test-component {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--h);
		width: var(--w);
		font-size: var(--fs);
		margin: auto;
	}

	.highlight {
		background: yellow;
	}

	.test-controls {
		position: fixed;
		right: 0;
		top: 0;
		width: var(--control-area-width);
		display: flex;
		flex-direction: column;
		background: rgba(240, 240, 240, 0.7);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		height: 100vh;
		font-family: monospace;
		color: #000;
		overflow: scroll;
		border-left: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 1001;
	}

	.hide-controls .test-controls {
		display: none;
	}

	.test-controls span {
		padding: 0.5em;
	}



	ul {
		list-style-type: none;
		padding-left: 1em;
	}

	.light-mode {
		--bg-color: #fff;
		--fg-color: rgba(0, 0, 0, var(--grid-opaqueness));
	}

	.dark-mode {
		--bg-color: #000;
		--fg-color: rgba(255, 255, 255, var(--grid-opaqueness));
	}

	.bg-0 {
		--grid-opaqueness: 0;
	}

	.bg-10 {
		--grid-opaqueness: 0.1;
	}

	.bg-20 {
		--grid-opaqueness: 0.2;
	}

	.bg-50 {
		--grid-opaqueness: 0.5;
	}

	.bg-100 {
		--grid-opaqueness: 1;
	}

	.grid {
		background:
			linear-gradient(var(--fg-color) 1px, transparent 0) repeat-y,
			linear-gradient(90deg, var(--fg-color) 1px, transparent 0) repeat-x,
			var(--bg-color);

		background-size: 20px 20px;
		background-position:
			0 0,
			10px 10px;
		background-repeat: repeat, repeat;
	}

	.light-mode.text.bg-10 {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="rgba(0,0,0,.1)" font-family="Arial">Lorem ipsum</text></svg>');
	}
	.light-mode.text.bg-20 {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="rgba(0,0,0,.2)" font-family="Arial">Lorem ipsum</text></svg>');
	}
	.light-mode.text.bg-50 {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="rgba(0,0,0,.5)" font-family="Arial">Lorem ipsum</text></svg>');
	}
	.light-mode.text.bg-100 {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="rgba(0,0,0,1)" font-family="Arial">Lorem ipsum</text></svg>');
	}

	.dark-mode.text.bg-10 {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="rgba(255,255,255,.1)" font-family="Arial">Lorem ipsum</text></svg>');
	}
	.dark-mode.text.bg-20 {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="rgba(255,255,255,.2)" font-family="Arial">Lorem ipsum</text></svg>');
	}
	.dark-mode.text.bg-50 {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="rgba(255,255,255,.5)" font-family="Arial">Lorem ipsum</text></svg>');
	}
	.dark-mode.text.bg-100 {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="rgba(255,255,255,1)" font-family="Arial">Lorem ipsum</text></svg>');
	}

	.text {
		background-repeat: repeat;
		background-size: 140px 30px;
		background-color: var(--bg-color);
	}

	/* ================================================================
	   Inlined CSS Reset (ress v5.0.2)
	   Applied globally when TestHarness is rendered
	   ================================================================ */

	:global(html) {
		box-sizing: border-box;
		-webkit-text-size-adjust: 100%;
		word-break: normal;
		-moz-tab-size: 4;
		tab-size: 4;
	}

	:global(*),
	:global(::before),
	:global(::after) {
		background-repeat: no-repeat;
		box-sizing: inherit;
	}

	:global(::before),
	:global(::after) {
		text-decoration: inherit;
		vertical-align: inherit;
	}

	:global(*) {
		padding: 0;
		margin: 0;
	}

	:global(hr) {
		overflow: visible;
		height: 0;
		color: inherit;
	}

	:global(details),
	:global(main) {
		display: block;
	}

	:global(summary) {
		display: list-item;
	}

	:global(small) {
		font-size: 80%;
	}

	:global([hidden]) {
		display: none;
	}

	:global(abbr[title]) {
		border-bottom: none;
		text-decoration: underline;
		text-decoration: underline dotted;
	}

	:global(a) {
		background-color: transparent;
	}

	:global(a:active),
	:global(a:hover) {
		outline-width: 0;
	}

	:global(code),
	:global(kbd),
	:global(pre),
	:global(samp) {
		font-family: monospace, monospace;
	}

	:global(pre) {
		font-size: 1em;
	}

	:global(b),
	:global(strong) {
		font-weight: bolder;
	}

	:global(sub),
	:global(sup) {
		font-size: 75%;
		line-height: 0;
		position: relative;
		vertical-align: baseline;
	}

	:global(sub) {
		bottom: -0.25em;
	}

	:global(sup) {
		top: -0.5em;
	}

	:global(table) {
		border-color: inherit;
		text-indent: 0;
	}

	:global(iframe) {
		border-style: none;
	}

	:global(input) {
		border-radius: 0;
	}

	:global([type='number']::-webkit-inner-spin-button),
	:global([type='number']::-webkit-outer-spin-button) {
		height: auto;
	}

	:global([type='search']) {
		-webkit-appearance: textfield;
		outline-offset: -2px;
	}

	:global([type='search']::-webkit-search-decoration) {
		-webkit-appearance: none;
	}

	:global(textarea) {
		overflow: auto;
		resize: vertical;
	}

	:global(button),
	:global(input),
	:global(optgroup),
	:global(select),
	:global(textarea) {
		font: inherit;
	}

	:global(optgroup) {
		font-weight: bold;
	}

	:global(button) {
		overflow: visible;
	}

	:global(button),
	:global(select) {
		text-transform: none;
	}

	:global(button),
	:global([type='button']),
	:global([type='reset']),
	:global([type='submit']),
	:global([role='button']) {
		cursor: pointer;
	}

	:global(button::-moz-focus-inner),
	:global([type='button']::-moz-focus-inner),
	:global([type='reset']::-moz-focus-inner),
	:global([type='submit']::-moz-focus-inner) {
		border-style: none;
		padding: 0;
	}

	:global(button:-moz-focusring),
	:global([type='button']::-moz-focus-inner),
	:global([type='reset']::-moz-focus-inner),
	:global([type='submit']::-moz-focus-inner) {
		outline: 1px dotted ButtonText;
	}

	:global(button),
	:global(html [type='button']),
	:global([type='reset']),
	:global([type='submit']) {
		-webkit-appearance: button;
	}

	:global(button),
	:global(input),
	:global(select),
	:global(textarea) {
		background-color: transparent;
		border-style: none;
	}

	:global(a:focus),
	:global(button:focus),
	:global(input:focus),
	:global(select:focus),
	:global(textarea:focus) {
		outline-width: 0;
	}

	:global(select) {
		-moz-appearance: none;
		-webkit-appearance: none;
	}

	:global(select::-ms-expand) {
		display: none;
	}

	:global(select::-ms-value) {
		color: currentColor;
	}

	:global(legend) {
		border: 0;
		color: inherit;
		display: table;
		max-width: 100%;
		white-space: normal;
	}

	:global(::-webkit-file-upload-button) {
		-webkit-appearance: button;
		color: inherit;
		font: inherit;
	}

	:global([disabled]) {
		cursor: default;
	}

	:global(img) {
		border-style: none;
	}

	:global(progress) {
		vertical-align: baseline;
	}

	:global([aria-busy='true']) {
		cursor: progress;
	}

	:global([aria-controls]) {
		cursor: pointer;
	}

	:global([aria-disabled='true']) {
		cursor: default;
	}
</style>
