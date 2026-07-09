<script lang="ts">
	import '../test-harness.css';
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
				<span
					style="display: flex; justify-content: space-between; align-items: center; padding: .25em .5em;"
				>
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
				<span
					style="display: flex; justify-content: space-between; align-items: center; padding: .25em .5em"
				>
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
					style="display: flex; justify-content: space-between; align-items: center; padding: .25em .5em"
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

<style src="./TestHarness.css"></style>
