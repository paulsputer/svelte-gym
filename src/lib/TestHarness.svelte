<script lang="ts">
	import './test-harness.css';
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
	} from './harnessHelpers.js';
	import { onMount, untrack, type Snippet } from 'svelte';

	import GymCheckbox from './GymCheckbox.svelte';
	import GymSlider from './GymSlider.svelte';
	import GymButton from './GymButton.svelte';
	import GymDropdown from './GymDropdown.svelte';
	import GymLog from './GymLog.svelte';
	import GymColorPicker from './GymColorPicker.svelte';
	import GymTextbox from './GymTextbox.svelte';

	interface TestHarnessProps {
		maxWidth?: number | null;
		maxHeight?: number | null;
		maxFontSize?: number | null;
		log?: string[];
		componentToTest?: Snippet;
		controls?: Snippet;
		logs?: Snippet;
		children?: Snippet;
	}

	let {
		maxWidth = null,
		maxHeight = null,
		maxFontSize = null,
		log,
		componentToTest,
		controls,
		logs,
		children
	}: TestHarnessProps = $props();

	let initialTab = controls ? 'specific' : 'basic';
	if (typeof window !== 'undefined') {
		const tab = new URL(window.location.href).searchParams.get('__tab');
		if (tab === 'basic' || tab === 'specific' || tab === 'props') {
			initialTab = tab;
		}
	}

	let activeTab = $state(initialTab);
	let cssVarTab = $state('All');
	let logsFullscreen = $state(false);

	let cssVars = $state<CssVarData[]>([]);
	let componentContainer: HTMLElement | undefined = $state(undefined);
	let cssVarObserver: MutationObserver | undefined = undefined;
	let cssVarTimeout: number | undefined = undefined;

	let cssVarStyles = $derived(
		cssVars
			.map((v) =>
				harnessProps[`__var_${v.name}`] !== undefined && harnessProps[`__var_${v.name}`] !== ''
					? `${v.name}: ${harnessProps[`__var_${v.name}`]};`
					: ''
			)
			.filter(Boolean)
			.join(' ')
	);

	$effect(() => {
		if (activeTab !== 'logs') {
			logsFullscreen = false;
		}
	});

	let harnessProps = $state({
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
	});

	let scrollMode = $derived(harnessProps.__scrollY != null);

	// Sync __scrollMode checkbox with __scrollY
	$effect(() => {
		if (harnessProps.__scrollMode && harnessProps.__scrollY === undefined) {
			harnessProps.__scrollY = (typeof window !== 'undefined' ? window.scrollY : 0) + 'px';
		} else if (!harnessProps.__scrollMode && harnessProps.__scrollY !== undefined) {
			harnessProps.__scrollY = undefined;
		}
	});

	let maxScroll = $state(0);

	function updateMaxScroll() {
		maxScroll = Math.max(0, document.body.scrollHeight - window.innerHeight);
	}

	let initialRestoration = true;

	onMount(() => {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}

		// Always enable reset — it also stops interpolations
		harnessProps.__resetAnimations = resetAnimations;

		// Track scroll height changes
		updateMaxScroll();

		setTimeout(extractCssVars, 100);

		cssVarObserver = new MutationObserver(() => {
			if (cssVarTimeout) clearTimeout(cssVarTimeout);
			cssVarTimeout = window.setTimeout(extractCssVars, 250);
		});

		if (componentContainer) {
			cssVarObserver.observe(componentContainer, { childList: true, subtree: true });
		}

		// Initial scroll restoration
		if (harnessProps.__scrollY !== undefined) {
			setTimeout(() => {
				window.scrollTo(0, parseFloat(harnessProps.__scrollY as string));
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

		const onPopState = () => restoreProps(harnessProps);
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
		for (const v of cssVars) {
			const propName = `__var_${v.name}`;
			if (!(propName in harnessProps)) {
				harnessProps[propName] = undefined;
			}
		}
	}

	let permalinkLabel = $state('Copy Permalink');

	async function copyPermalink(e: Event) {
		e.preventDefault();
		const url = getPermalinkUrl(window.location.href, harnessProps.__scrollY);
		await navigator.clipboard.writeText(url);
		permalinkLabel = 'Copied!';
		setTimeout(() => (permalinkLabel = 'Copy Permalink'), 1500);
	}

	function resetProps() {
		window.location.href = getResetUrl(window.location.href, activeTab);
	}

	$effect.pre(() => {
		if (typeof window !== 'undefined') {
			untrack(() => restoreProps(harnessProps));
		}
	});

	function updateScroll() {
		// Prevent initial 0 from overwriting restored value
		if (initialRestoration && harnessProps.__scrollY !== undefined) return;

		const y = window.scrollY;
		if (harnessProps.__scrollY !== undefined || y > 0) {
			harnessProps.__scrollY = y + 'px';
		}
	}

	$effect(() => {
		if (
			harnessProps.__scrollY !== undefined &&
			Math.abs(window.scrollY - parseFloat(harnessProps.__scrollY)) > 5
		) {
			window.scrollTo(0, parseFloat(harnessProps.__scrollY));
		}
	});
</script>

<svelte:window onscroll={updateScroll} />

<section class={harnessProps.__controls ? '' : 'hide-controls'}>
	<div class="test-grid {getGridClassFromValue(harnessProps.__grid)}"></div>

	<div class="test-area" class:controls={harnessProps.__controls}>
		<div
			class="test-holder"
			class:scroll-mode={scrollMode}
			style="
				--holder-justify: {getAnchorStyles(harnessProps.__anchor).justify};
				--holder-align: {getAnchorStyles(harnessProps.__anchor).align};
			"
		>
			<div
				class="test-component"
				class:highlight={harnessProps.__highlight}
				bind:this={componentContainer}
				style="
				--w:{harnessProps.__width};
				--h:{harnessProps.__height};
				--fs:{harnessProps.__fontsize};
				--component-justify: {getAnchorStyles(harnessProps.__anchor).justify};
				--component-align: {getAnchorStyles(harnessProps.__anchor).align};
				--component-margin: {getAnchorStyles(harnessProps.__anchor).margin};
				{cssVarStyles}"
			>
				{#if componentToTest}
					{@render componentToTest()}
				{:else if children}
					{@render children()}
				{/if}
			</div>
		</div>
		<div class="test-controls" class:logs-fullscreen={logsFullscreen}>
			<div class="tabs">
				<button class:active={activeTab === 'basic'} onclick={() => (activeTab = 'basic')}
					>Basic</button
				>
				{#if controls}
					<button class:active={activeTab === 'specific'} onclick={() => (activeTab = 'specific')}
						>Specific</button
					>
				{/if}
				{#if logs || log}
					<button class:active={activeTab === 'logs'} onclick={() => (activeTab = 'logs')}>
						Logs
						{#if log && log.length > 0}
							<span class="log-count">{log.length}</span>
						{/if}
					</button>
				{/if}
			</div>

			<div style:display={activeTab === 'basic' ? 'block' : 'none'}>
				<span
					style="display: flex; justify-content: space-between; align-items: center; padding: .25em .5em"
				>
					<button type="button" class="link-button" onclick={copyPermalink}>{permalinkLabel}</button
					>
					<button type="button" class="link-button" onclick={resetProps}>Reset</button>
				</span>
				<br />
				<ul>
					<li>
						<GymCheckbox
							hideExtra={true}
							bind:props={harnessProps}
							name="__controls"
							label="controls"
						/>
					</li>
					<li>
						<GymCheckbox
							hideExtra={true}
							bind:props={harnessProps}
							name="__scrollMode"
							label="scroll mode"
						/>
					</li>
					<GymDropdown
						hideExtra={true}
						bind:props={harnessProps}
						name="__grid"
						label="grid"
						options={gridOptions}
						optLabel="value"
						optValue="value"
					/>
					<li>
						<GymCheckbox
							hideExtra={true}
							bind:props={harnessProps}
							name="__highlight"
							label="highlight"
						/>
					</li>
				</ul>
				<div class="gym-control">
					<span class="gym-label">anchor</span>
					<div class="anchor-grid">
						{#each ['top-left', 'top-center', 'top-right', 'center-left', 'center-center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'] as anchorOption}
							<button
								type="button"
								class="anchor-btn"
								class:active={harnessProps.__anchor === anchorOption}
								title={anchorOption}
								onclick={() => setProp(anchorOption, '__anchor', harnessProps)}
							>
							</button>
						{/each}
					</div>
				</div>
				<GymButton props={harnessProps} name="__resetAnimations" label="Reset Animations" />

				<br />
				<GymSlider
					hideExtra={true}
					units="px"
					max={maxWidth}
					bind:props={harnessProps}
					name="__width"
					label="width"
				/>
				<GymSlider
					hideExtra={true}
					units="px"
					max={maxHeight}
					bind:props={harnessProps}
					name="__height"
					label="height"
				/>
				<GymSlider
					hideExtra={true}
					max={maxFontSize}
					bind:props={harnessProps}
					name="__fontsize"
					label="fontsize"
				/>
				<GymSlider
					hideExtra={true}
					units="px"
					max={maxScroll}
					bind:props={harnessProps}
					name="__scrollY"
					label="scrollY"
				/>
				{#if Object.keys(harnessProps).some((p) => p.startsWith('__var_'))}
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
									onclick={() => (cssVarTab = tabName)}>{tabName}</button
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
										bind:props={harnessProps}
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
										bind:props={harnessProps}
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
										bind:props={harnessProps}
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

			<div style:display={activeTab === 'specific' ? 'block' : 'none'}>
				<span
					style="display: flex; justify-content: space-between; align-items: center; padding: .25em .5em"
				>
					<button type="button" class="link-button" onclick={copyPermalink}>{permalinkLabel}</button
					>
					<button type="button" class="link-button" onclick={resetProps}>Reset</button>
				</span>
				<hr />
				<br />
				<span>
					{#if controls}
						{@render controls()}
					{/if}
				</span>
			</div>

			<div style:display={activeTab === 'logs' ? 'flex' : 'none'} class="logs-tab">
				<span
					class="logs-header"
					style="display: flex; justify-content: space-between; align-items: center; padding: .25em .5em"
				>
					<button
						type="button"
						class="link-button"
						onclick={() => (logsFullscreen = !logsFullscreen)}
						>{logsFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button
					>
					<button
						type="button"
						class="link-button"
						onclick={() => {
							if (log) {
								log.length = 0;
							}
						}}>Reset</button
					>
				</span>
				<hr />
				{#if logs}
					{@render logs()}
				{:else if log}
					<GymLog {log} />
				{/if}
			</div>
		</div>
	</div>
</section>
