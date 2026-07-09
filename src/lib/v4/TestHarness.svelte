<script lang="ts">
	import { restoreProps, setProp } from './helpers.js';
	import {
		gridOptions,
		getGridClassFromValue,
		getAnchorStyles,
		resetAnimations,
		getPermalinkUrl,
		getResetUrl,
		parseCssVars,
		filterCssVarsByTab,
		type CssVarData
	} from '../harnessHelpers.js';
	import { onMount } from 'svelte';

	import GymCheckbox from './GymCheckbox.svelte';
	import GymSlider from './GymSlider.svelte';
	import GymButton from './GymButton.svelte';
	import GymDropdown from './GymDropdown.svelte';
	import GymLog from './GymLog.svelte';
	import GymColorPicker from './GymColorPicker.svelte';
	import GymTextbox from './GymTextbox.svelte';

	export let maxWidth: number | null = null;
	export let maxHeight: number | null = null;
	export let maxFontSize: number | null = null;
	export let log: string[] | undefined = undefined;

	let activeTab = $$slots.controls ? 'specific' : 'basic';
	let initialTab = activeTab;
	if (typeof window !== 'undefined') {
		const urlTab = new URL(window.location.href).searchParams.get('__tab');
		if (urlTab === 'basic' || urlTab === 'specific' || urlTab === 'logs') {
			initialTab = urlTab;
		}
	}
	let tab = initialTab;
	let cssVarTab = 'All';
	let logsFullscreen = false;

	let cssVars: CssVarData[] = [];
	let componentContainer: HTMLElement | undefined = undefined;
	let cssVarObserver: MutationObserver | undefined = undefined;
	let cssVarTimeout: number | undefined = undefined;

	$: cssVarStyles = cssVars
		.map((v) =>
			props[`__var_${v.name}`] !== undefined && props[`__var_${v.name}`] !== ''
				? `${v.name}: ${props[`__var_${v.name}`]};`
				: ''
		)
		.filter(Boolean)
		.join(' ');

	$: if (tab !== 'logs') {
		logsFullscreen = false;
	}

	let props = {
		__controls: true,
		__grid: '20-grid-light-mode',
		__highlight: true,
		__scrollMode: false,
		__width: 'auto',
		__height: 'auto',
		__fontsize: '1em',
		__anchor: 'center-center',
		__resetAnimations: () => {},
		__scrollY: undefined as string | undefined
	};

	if (typeof window !== 'undefined') {
		restoreProps(props);
	}

	$: scrollMode = props.__scrollY != null;

	// Sync __scrollMode checkbox with __scrollY
	$: {
		if (props.__scrollMode && props.__scrollY === undefined) {
			props.__scrollY = (typeof window !== 'undefined' ? window.scrollY : 0) + 'px';
		} else if (!props.__scrollMode && props.__scrollY !== undefined) {
			props.__scrollY = undefined;
		}
	}

	let maxScroll = 0;

	function updateMaxScroll() {
		maxScroll = Math.max(0, document.body.scrollHeight - window.innerHeight);
	}

	let initialRestoration = true;

	onMount(() => {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}

		props.__resetAnimations = resetAnimations;

		updateMaxScroll();

		if (props.__scrollY !== undefined) {
			setTimeout(() => {
				window.scrollTo(0, parseFloat(props.__scrollY as string));
				initialRestoration = false;
			}, 100);
		} else {
			initialRestoration = false;
		}

		setTimeout(extractCssVars, 100);

		cssVarObserver = new MutationObserver(() => {
			if (cssVarTimeout) clearTimeout(cssVarTimeout);
			cssVarTimeout = window.setTimeout(extractCssVars, 250);
		});
		if (componentContainer) {
			cssVarObserver.observe(componentContainer, { childList: true, subtree: true });
		}

		const resizeObserver = new ResizeObserver(() => {
			updateMaxScroll();
		});
		resizeObserver.observe(document.body);

		window.addEventListener('resize', updateMaxScroll);

		const onPopState = () => {
			restoreProps(props);
			props = props;
		};
		window.addEventListener('popstate', onPopState);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', updateMaxScroll);
			window.removeEventListener('popstate', onPopState);
			if (cssVarObserver) cssVarObserver.disconnect();
			if (cssVarTimeout) clearTimeout(cssVarTimeout);
		};
	});

	function extractCssVars() {
		if (!componentContainer) return;
		cssVars = parseCssVars(componentContainer);

		let propsChanged = false;
		for (const v of cssVars) {
			const propName = `__var_${v.name}`;
			if (!(propName in props)) {
				props[propName] = undefined;
				propsChanged = true;
			}
		}
		if (propsChanged) props = props;
	}

	let permalinkLabel = 'Copy Permalink';

	async function copyPermalink(e: Event) {
		e.preventDefault();
		const url = getPermalinkUrl(window.location.href, props.__scrollY);
		await navigator.clipboard.writeText(url);
		permalinkLabel = 'Copied!';
		setTimeout(() => (permalinkLabel = 'Copy Permalink'), 1500);
	}

	function resetProps() {
		window.location.href = getResetUrl(window.location.href, tab);
	}

	function updateScroll() {
		if (initialRestoration && props.__scrollY !== undefined) return;

		const y = window.scrollY;
		if (props.__scrollY !== undefined || y > 0) {
			props.__scrollY = y + 'px';
		}
	}

	$: {
		if (
			props.__scrollY !== undefined &&
			typeof window !== 'undefined' &&
			Math.abs(window.scrollY - parseFloat(props.__scrollY)) > 5
		) {
			window.scrollTo(0, parseFloat(props.__scrollY));
		}
	}
	$: anchorStyles = getAnchorStyles(props.__anchor);
</script>

<svelte:window on:scroll={updateScroll} />

<section class={props.__controls ? '' : 'hide-controls'}>
	<div class="test-grid {getGridClassFromValue(props.__grid)}"></div>

	<div class="test-area" class:controls={props.__controls}>
		<div
			class="test-holder"
			class:scroll-mode={scrollMode}
			style="
				--holder-justify: {anchorStyles.justify};
				--holder-align: {anchorStyles.align};
			"
		>
			<div
				class="test-component"
				class:highlight={props.__highlight}
				bind:this={componentContainer}
				style="
					--w: {props.__width};
					--h: {props.__height};
					--fs: {props.__fontsize};
					--component-justify: {anchorStyles.justify};
					--component-align: {anchorStyles.align};
					--component-margin: {anchorStyles.margin};
					{cssVarStyles}
				"
			>
				{#if $$slots.componentToTest}
					<slot name="componentToTest" />
				{:else}
					<slot />
				{/if}
			</div>
		</div>
		<div class="test-controls" class:logs-fullscreen={logsFullscreen}>
			<div class="tabs">
				<button class:active={tab === 'basic'} on:click={() => (tab = 'basic')}>Basic</button>
				{#if $$slots.controls}
					<button class:active={tab === 'specific'} on:click={() => (tab = 'specific')}
						>Specific</button
					>
				{/if}
				{#if $$slots.logs || log}
					<button class:active={tab === 'logs'} on:click={() => (tab = 'logs')}>
						Logs
						{#if log && log.length > 0}
							<span class="log-count">{log.length}</span>
						{/if}
					</button>
				{/if}
			</div>

			<div style:display={tab === 'basic' ? 'block' : 'none'}>
				<span style="display: flex; justify-content: space-between; align-items: center;">
					<button type="button" class="link-button" on:click={copyPermalink}
						>{permalinkLabel}</button
					>
					<button type="button" class="link-button" on:click={resetProps}>Reset</button>
				</span>
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
				<div class="gym-control">
					<span class="gym-label">anchor</span>
					<div class="anchor-grid">
						{#each ['top-left', 'top-center', 'top-right', 'center-left', 'center-center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'] as anchorOption}
							<button
								type="button"
								class="anchor-btn"
								class:active={props.__anchor === anchorOption}
								title={anchorOption}
								on:click={() => {
									props.__anchor = anchorOption;
									setProp(anchorOption, '__anchor', props);
								}}
							>
							</button>
						{/each}
					</div>
				</div>
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
				<GymSlider
					hideExtra={true}
					max={maxFontSize}
					bind:props
					name="__fontsize"
					label="fontsize"
				/>
				<GymSlider
					hideExtra={true}
					units="px"
					max={maxScroll}
					bind:props
					name="__scrollY"
					label="scrollY"
				/>
				{#if cssVars.length > 0}
					<div class="harness-section props-section props-css-vars">
						<div class="gym-section-header">
							<span class="gym-label" style="margin-bottom: 0;">CSS Variables</span>
							<span class="gym-badge">{cssVars.length}</span>
						</div>

						<div class="gym-sub-tabs">
							{#each ['All', 'Defined', 'Inherited', 'Unset', 'Unused'] as tabName}
								<button
									class="gym-sub-tab"
									class:active={cssVarTab === tabName}
									on:click={() => (cssVarTab = tabName)}>{tabName}</button
								>
							{/each}
						</div>

						{#each filterCssVarsByTab(cssVars, cssVarTab) as v}
							<div class="gym-css-var-row {v.isDefined ? '' : 'undefined-prop'}">
								<div class="gym-css-var-badges">
									{#if !v.isDefined}
										<span class="gym-badge gym-badge-unset">unset</span>
									{:else if v.definedBy === 'Inherited'}
										<span class="gym-badge gym-badge-defined" title={v.definedBy}
											>{v.definedBy}</span
										>
									{/if}
									{#if !v.isUsed}
										<span class="gym-badge gym-badge-unused">unused</span>
									{/if}
								</div>
								{#if v.type === 'color'}
									<GymColorPicker
										bind:props
										name="__var_{v.name}"
										label={v.label}
										hideExtra={true}
										fallback={v.fallback}
										subLabel={v.isDefined && v.definedBy && v.definedBy !== 'Inherited'
											? `defined in: ${v.definedBy}`
											: undefined}
									/>
								{:else if v.type === 'number'}
									<GymSlider
										bind:props
										name="__var_{v.name}"
										label={v.label}
										hideExtra={true}
										units={v.unit || undefined}
										fallback={v.fallback
											? Number(v.fallback.replace(/[a-zA-Z%]+$/, ''))
											: undefined}
										subLabel={v.isDefined && v.definedBy && v.definedBy !== 'Inherited'
											? `defined in: ${v.definedBy}`
											: undefined}
									/>
								{:else}
									<GymTextbox
										bind:props
										name="__var_{v.name}"
										label={v.label}
										hideExtra={true}
										fallback={v.fallback}
										subLabel={v.isDefined && v.definedBy && v.definedBy !== 'Inherited'
											? `defined in: ${v.definedBy}`
											: undefined}
									/>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div style:display={tab === 'specific' ? 'block' : 'none'}>
				<span style="display: flex; justify-content: space-between; align-items: center;">
					<button type="button" class="link-button" on:click={copyPermalink}
						>{permalinkLabel}</button
					>
					<button type="button" class="link-button" on:click={resetProps}>Reset</button>
				</span>
				<hr />
				<br />
				<span>
					<slot name="controls" />
				</span>
			</div>

			<div style:display={tab === 'logs' ? 'flex' : 'none'} class="logs-tab">
				<span
					class="logs-header"
					style="display: flex; justify-content: space-between; align-items: center;"
				>
					<button
						type="button"
						class="link-button"
						on:click={() => (logsFullscreen = !logsFullscreen)}
						>{logsFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button
					>
					<button
						type="button"
						class="link-button"
						on:click={() => {
							if (log) {
								log.length = 0;
								log = log;
							}
						}}>Reset</button
					>
				</span>
				<hr />
				{#if $$slots.logs}
					<slot name="logs" />
				{:else if log}
					<GymLog {log} />
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	:root {
		--control-area-width: 320px;
		--bg-color: #fff;
		--gym-primary: #000;
		--gym-bg: #fff;
		--gym-bg-hover: rgba(0, 0, 0, 0.05);
		--gym-border: rgba(0, 0, 0, 0.1);
		--gym-text-muted: #555;
		--gym-text: #000;
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

	.test-area.controls .test-holder {
		padding-right: var(--control-area-width);
	}

	.test-holder {
		display: flex;
		justify-content: var(--holder-justify, center);
		align-items: var(--holder-align, center);
		min-height: 100vh;
		width: 100%;
		box-sizing: border-box;
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
		align-items: var(--component-align, center);
		justify-content: var(--component-justify, center);
		height: var(--h);
		width: var(--w);
		font-size: var(--fs);
		margin: var(--component-margin, auto);
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

	.test-controls.logs-fullscreen {
		width: 100vw;
		background: rgba(250, 250, 250, 0.95);
	}

	.test-controls.logs-fullscreen .tabs,
	.test-controls.logs-fullscreen .logs-header {
		width: var(--control-area-width);
		align-self: flex-end;
	}

	.hide-controls .test-controls {
		display: none;
	}

	.test-controls span {
		padding: 0.5em;
		display: block;
	}

	.tabs {
		display: flex;
		border-bottom: 1px solid #ccc;
		background: rgba(250, 250, 250, 0.9);
	}

	.tabs button {
		flex: 1;
		padding: 0.75em 0.5em;
		border: none;
		background: none;
		cursor: pointer;
		font: inherit;
		font-weight: normal;
		border-bottom: 2px solid transparent;
		color: #555;
		position: relative;
	}

	.tabs button:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.tabs button.active {
		border-bottom: 2px solid #000;
		font-weight: bold;
		color: #000;
	}

	.log-count {
		position: absolute;
		top: 4px;
		right: 4px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: #e65100;
		color: #fff;
		font-size: 10px;
		font-weight: bold;
		border-radius: 10px;
		height: 16px;
		min-width: 16px;
		padding: 0 4px;
		box-sizing: border-box;
		line-height: 1;
	}

	.logs-tab {
		flex-direction: column;
		height: 100%;
		overflow: hidden;
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

	.gym-control {
		padding: 0.4em 0.75em;
	}

	.gym-label {
		display: block;
		text-transform: capitalize;
		font-weight: 600;
		color: #000;
		text-align: left;
		margin-bottom: 0.25em;
	}

	.anchor-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
		width: 108px;
		height: 108px;
		margin-top: 0.4em;
		background: rgba(0, 0, 0, 0.02);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 6px;
		padding: 6px;
	}

	.anchor-btn {
		background: rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease-in-out;
		padding: 0;
	}

	.anchor-btn:hover {
		background: rgba(0, 0, 0, 0.12);
		transform: scale(1.05);
	}

	.anchor-btn.active {
		background: #333;
		border-color: #3e3e3e;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	.gym-css-var-row {
		position: relative;
		margin-bottom: 0.5em;
	}

	.gym-css-var-badges {
		display: flex;
		gap: 4px;
		position: absolute;
		top: 6px;
		right: 12px;
		z-index: 2;
	}

	.gym-badge,
	:global(.gym-badge) {
		font-size: 0.65rem;
		padding: 2px 4px;
		border-radius: 3px;
		font-family: monospace;
		text-transform: uppercase;
		font-weight: bold;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100px;
		border: 1px solid rgba(0, 0, 0, 0.18);
		background: rgba(255, 255, 255, 0.45);
		color: #999;
	}

	.gym-badge-unset {
		color: #c62828;
		background: rgba(255, 205, 210, 0.5);
		border-color: #ef9a9a;
	}

	.gym-badge-unused {
		color: #f57f17;
		background: rgba(255, 249, 196, 0.5);
		border-color: #fff59d;
	}

	.gym-section-header,
	.test-controls :global(article > header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(0, 0, 0, 0.05);
		padding: 0.5em 0.75em;
		border-top: 1px solid var(--gym-border);
		border-bottom: 1px solid var(--gym-border);
		margin-top: 1em;
		margin-bottom: 0.75em;
	}

	.test-controls :global(article > header > h1),
	.test-controls :global(article > header > h2),
	.test-controls :global(article > header > h3),
	.test-controls :global(article > header > h4),
	.test-controls :global(article > header > h5),
	.test-controls :global(article > header > h6) {
		display: block;
		text-transform: capitalize;
		font-weight: 600;
		color: #000;
		text-align: left;
		margin-bottom: 0;
		font-size: 1em;
	}

	.gym-badge-defined {
		background: #e0f2fe;
		color: #0284c7;
		border-color: #7dd3fc;
	}

	.gym-sub-tabs {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 1rem;
		padding: 0 0.5rem;
	}
	.gym-sub-tab {
		background: var(--gym-bg-hover);
		border: 1px solid var(--gym-border);
		color: var(--gym-text-muted);
		cursor: pointer;
		padding: 0.15rem 0.25rem;
		border-radius: 4px;
		font-family: inherit;
		font-size: 0.75rem;
	}
	.gym-sub-tab:hover {
		color: var(--gym-text);
	}
	.gym-sub-tab.active {
		background: var(--gym-primary);
		color: var(--gym-bg);
		border-color: var(--gym-primary);
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
