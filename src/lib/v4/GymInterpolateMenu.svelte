<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { setProp } from './helpers.js';
	import GymOverrideButtons from './GymOverrideButtons.svelte';

	export let mode: 'slider' | 'text';
	export let multiline: boolean = false;
	export let sliderMin: number = 0;
	export let sliderMax: number = 100;
	export let units: string | null = null;
	export let propName: string;
	export let props: Record<string, any>;
	export let open: boolean = false;

	let active = false;
	let animFrameId: number | null = null;
	let startTime: number = 0;

	// Interpolation config
	let cpm = 20;
	
	// 'text' sub-modes
	let textModeOverride: 'text' | 'number' | 'date' | 'time' | null = null;
	let detectedTextMode: 'text' | 'number' | 'date' | 'time' = 'text';
	
	$: effectiveTextMode = (() => {
		if (mode === 'slider') return 'slider';
		if (textModeOverride) return textModeOverride;
		return detectedTextMode;
	})();

	let interpMin = 0;
	let interpMax = 100;
	let useCustomRange = false;

	let interpMinDate = '';
	let interpMaxDate = '';
	let useCustomDateRange = false;

	let dateFormatOverride: 'mm-dd' | 'dd-mm' | null = null;

	function detectDateFormat(str: string): 'mm-dd' | 'dd-mm' {
		const tokens = [...str.matchAll(/\d+/g)].map(m => m[0]);
		const yearIdx = tokens.findIndex(t => t.length === 4);
		const otherTokens = tokens.filter((t, i) => i !== yearIdx);
		if (otherTokens.length >= 2) {
			const num0 = parseInt(otherTokens[0], 10);
			const num1 = parseInt(otherTokens[1], 10);
			if (num0 > 12) return 'dd-mm';
			if (num1 > 12) return 'mm-dd';
		}
		return 'mm-dd';
	}

	$: effectiveDateFormat = (() => {
		if (dateFormatOverride) return dateFormatOverride;
		const val = getCurrentVal();
		return detectDateFormat(typeof val === 'string' ? val : String(val));
	})();

	// Lorem ipsum for text mode
	const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra.`;

	function getCurrentVal() {
		const keys = propName.split('.');
		return keys.reduce((acc, key) => acc?.[key], props);
	}

	function detectType(val: any): 'text' | 'number' | 'date' | 'time' {
		if (typeof val !== 'string') return 'text';
		if (val.trim() === '') return 'text';
		
		// If it's purely numeric
		if (!isNaN(Number(val))) return 'number';
		
		// If it has dates (e.g. contains 202x, dashes, slashes, colons)
		// Try parsing as date
		const d = new Date(val);
		if (!isNaN(d.getTime())) {
			// Avoid parsing simple words as dates
			const hasNum = /\d/.test(val);
			if (hasNum) return 'date';
		}

		// Fallback for non-standard dates (e.g. DD-MM-YYYY) that JS Date rejects
		const tokens = [...val.matchAll(/\d+/g)].map(m => m[0]);
		if (tokens.length >= 3 && tokens.some(t => t.length === 4)) {
			return 'date';
		}

		// Fallback for pure time strings (e.g. 09:24 or 09:24:12)
		if (/^\s*\d{1,2}:\d{2}(:\d{2})?\s*$/.test(val)) {
			return 'time';
		}
		
		return 'text';
	}

	$: {
		if (open && mode === 'text' && !active) {
			const val = getCurrentVal();
			detectedTextMode = detectType(val);
		}
	}

	// Date format utilities
	function parseDateTokens(str: string, mmddFormat: 'mm-dd' | 'dd-mm') {
		const tokens = [...str.matchAll(/\d+/g)].map(m => ({ val: m[0], index: m.index, length: m[0].length }));
		const mapping: Record<string, {val: string, index: number, length: number}> = {};
		
		const isTimeOnly = /^\s*\d{1,2}:\d{2}(:\d{2})?\s*$/.test(str);
		if (isTimeOnly) {
			if (tokens.length > 0) { mapping['Hour'] = tokens[0]; }
			if (tokens.length > 1) { mapping['Minute'] = tokens[1]; }
			if (tokens.length > 2) { mapping['Second'] = tokens[2]; }
			return mapping;
		}

		const yearIdx = tokens.findIndex(t => t.length === 4);
		if (yearIdx !== -1) {
			mapping['Year'] = tokens[yearIdx];
			tokens.splice(yearIdx, 1);
		}
		
		if (tokens.length >= 2) {
			if (mmddFormat === 'dd-mm') {
				mapping['Day'] = tokens[0];
				mapping['Month'] = tokens[1];
			} else {
				mapping['Month'] = tokens[0];
				mapping['Day'] = tokens[1];
			}
			tokens.splice(0, 2);
		} else if (tokens.length === 1) {
			mapping['Month'] = tokens[0];
			tokens.splice(0, 1);
		}
		
		if (tokens.length > 0) { mapping['Hour'] = tokens[0]; }
		if (tokens.length > 1) { mapping['Minute'] = tokens[1]; }
		if (tokens.length > 2) { mapping['Second'] = tokens[2]; }
		
		return mapping;
	}

	function parseToTimestamp(str: string, mmddFormat: 'mm-dd' | 'dd-mm'): number {
		const mapping = parseDateTokens(str, mmddFormat);
		const now = new Date();
		let y = now.getFullYear(), m = 0, d = 1, h = 0, min = 0, s = 0;
		if (mapping['Year']) { y = parseInt(mapping['Year'].val, 10);} 
		if (mapping['Month']) { m = parseInt(mapping['Month'].val, 10) - 1;} 
		if (mapping['Day']) { d = parseInt(mapping['Day'].val, 10);} 
		if (mapping['Hour']) { h = parseInt(mapping['Hour'].val, 10);} 
		if (mapping['Minute']) { min = parseInt(mapping['Minute'].val, 10);} 
		if (mapping['Second']) { s = parseInt(mapping['Second'].val, 10);} 
		return new Date(y, m, d, h, min, s).getTime();
	}

	function formatTimestamp(ts: number, baseStr: string, mapping: Record<string, {val: string, index: number, length: number}>) {
		const d = new Date(ts);
		let resultStr = baseStr;
		const parts = Object.entries(mapping).map(([k, v]) => ({ block: k, ...v })).sort((a, b) => b.index - a.index);
		
		for (const p of parts) {
			let num = 0;
			if (p.block === 'Year') { num = d.getFullYear();}
			else if (p.block === 'Month') { num = d.getMonth() + 1;}
			else if (p.block === 'Day') { num = d.getDate();}
			else if (p.block === 'Hour') { num = d.getHours();}
			else if (p.block === 'Minute') { num = d.getMinutes();}
			else if (p.block === 'Second') { num = d.getSeconds();}
			
			let padStr = String(num).padStart(p.length, '0');
			resultStr = resultStr.substring(0, p.index) + padStr + resultStr.substring(p.index + p.length);
		}
		return resultStr;
	}

	// Derive defaults
	$: {
		if (mode === 'slider' && !useCustomRange) {
			interpMin = sliderMin;
			interpMax = sliderMax;
		} else if (mode === 'text') {
			if (effectiveTextMode === 'number' && !useCustomRange) {
				const val = getCurrentVal();
				const num = parseFloat(val);
				if (!isNaN(num)) {
					if (num === 0) {
						interpMin = -10;
						interpMax = 10;
					} else {
						let spread = Math.abs(num) * 0.5;
						interpMin = num - spread;
						interpMax = num + spread;
					}
				}
			} else if (effectiveTextMode === 'text' && !useCustomRange) {
				interpMin = 0;
				interpMax = multiline ? 500 : 120;
			} else if (effectiveTextMode === 'date' && !useCustomDateRange) {
				const val = getCurrentVal();
				const strVal = typeof val === 'string' ? val : String(val);
				const ts = parseToTimestamp(strVal, effectiveDateFormat);
				if (!isNaN(ts)) {
					const minTs = ts - 7 * 24 * 60 * 60 * 1000;
					const maxTs = ts + 7 * 24 * 60 * 60 * 1000;
					const mapping = parseDateTokens(strVal, effectiveDateFormat);
					interpMinDate = formatTimestamp(minTs, strVal, mapping);
					interpMaxDate = formatTimestamp(maxTs, strVal, mapping);
				}
			} else if (effectiveTextMode === 'time' && !useCustomDateRange) {
				const val = getCurrentVal();
				const strVal = typeof val === 'string' ? val : String(val);
				const ts = parseToTimestamp(strVal, effectiveDateFormat);
				if (!isNaN(ts)) {
					const minTs = ts - 6 * 60 * 60 * 1000; // -6 hours
					const maxTs = ts + 6 * 60 * 60 * 1000;
					const mapping = parseDateTokens(strVal, effectiveDateFormat);
					interpMinDate = formatTimestamp(minTs, strVal, mapping);
					interpMaxDate = formatTimestamp(maxTs, strVal, mapping);
				}
			}
		}
	}

	function getEffectiveMin() {
		return useCustomRange ? interpMin : mode === 'slider' ? sliderMin : 0;
	}

	function getEffectiveMax() {
		return useCustomRange ? interpMax : mode === 'slider' ? sliderMax : multiline ? 500 : 120;
	}

	function toggleMenu(e: MouseEvent) {
		e.stopPropagation();
		const willOpen = !open;
		if (willOpen) {
			window.dispatchEvent(new CustomEvent('gymCloseOtherInterpolations'));
		}
		open = willOpen;
	}

	function startInterpolation() {
		if (active) return;
		useCustomRange = true;
		useCustomDateRange = true;
		active = true;
		startTime = performance.now();
		
		const baseVal = getCurrentVal();
		let baseStr = typeof baseVal === 'string' ? baseVal : String(baseVal);
		let decimalsMatch = baseStr.match(/\.(\d+)/);
		let baseDecimals = decimalsMatch ? decimalsMatch[1].length : 0;

		let baseDateMapping = (effectiveTextMode === 'date' || effectiveTextMode === 'time') ? parseDateTokens(baseStr, effectiveDateFormat) : null;
		let minDateTs = 0, maxDateTs = 0;
		if ((effectiveTextMode === 'date' || effectiveTextMode === 'time') && baseDateMapping) {
			minDateTs = parseToTimestamp(interpMinDate, effectiveDateFormat);
			maxDateTs = parseToTimestamp(interpMaxDate, effectiveDateFormat);
		}

		function animate(now: number) {
			if (!active) return;
			const elapsed = (now - startTime) / 1000;
			const frequency = cpm / 60;
			const sine = Math.sin(2 * Math.PI * frequency * elapsed); // -1 to 1
			const sine01 = 0.5 + 0.5 * sine; // 0 to 1

			if (mode === 'slider') {
				const eMin = getEffectiveMin();
				const eMax = getEffectiveMax();
				const value = eMin + (eMax - eMin) * sine01;
				const rounded = Math.round(value);
				setProp(rounded, propName, props, units ?? undefined, true);
				props = props;
			} else if (effectiveTextMode === 'number') {
				const eMin = getEffectiveMin();
				const eMax = getEffectiveMax();
				const value = eMin + (eMax - eMin) * sine01;
				
				setProp(value.toFixed(baseDecimals), propName, props, undefined, true);
				props = props;
			} else if ((effectiveTextMode === 'date' || effectiveTextMode === 'time') && baseDateMapping) {
				const currentTs = minDateTs + (maxDateTs - minDateTs) * sine01;
				const resultStr = formatTimestamp(currentTs, baseStr, baseDateMapping);
				setProp(resultStr, propName, props, undefined, true);
				props = props;
			} else {
				// Text length mode
				const eMin = getEffectiveMin();
				const eMax = getEffectiveMax();
				const len = Math.floor(eMin + (eMax - eMin) * sine01);
				let text = '';
				while (text.length < len) {
					text += LOREM;
				}
				text = text.slice(0, len);
				setProp(text, propName, props, undefined, true);
				props = props;
			}

			animFrameId = requestAnimationFrame(animate);
		}

		animFrameId = requestAnimationFrame(animate);
		updatePermalink();
	}

	function stopInterpolation() {
		active = false;
		if (animFrameId !== null) {
			cancelAnimationFrame(animFrameId);
			animFrameId = null;
		}
		removePermalink();
	}

	function updatePermalink() {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		const config = JSON.stringify({
			mode,
			cpm,
			min: getEffectiveMin(),
			max: getEffectiveMax(),
			multiline,
			textModeOverride,
			dateFormatOverride,
			interpMinDate,
			interpMaxDate
		});
		url.searchParams.set(`__interp_${propName}`, config);
		history.replaceState(null, '', url.toString());
	}

	function removePermalink() {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		url.searchParams.delete(`__interp_${propName}`);

		const currentVal = getCurrentVal();
		if (currentVal !== undefined) {
			url.searchParams.set(propName, '' + currentVal);
		}

		history.replaceState(null, '', url.toString());
	}

	onMount(() => {
		const params = new URL(window.location.href).searchParams;
		const configStr = params.get(`__interp_${propName}`);
		if (configStr) {
			try {
				const config = JSON.parse(configStr);
				cpm = config.cpm ?? 20;
				if (config.min !== undefined) {
					interpMin = config.min;
					useCustomRange = true;
				}
				if (config.max !== undefined) {
					interpMax = config.max;
					useCustomRange = true;
				}
				if (config.textModeOverride)  {textModeOverride = config.textModeOverride;}
				if (config.dateFormatOverride) {dateFormatOverride = config.dateFormatOverride;}
				if (config.interpMinDate) {
					interpMinDate = config.interpMinDate;
					useCustomDateRange = true;
				}
				if (config.interpMaxDate) {
					interpMaxDate = config.interpMaxDate;
					useCustomDateRange = true;
				}
				
				startInterpolation();
			} catch {
				// ignore bad config
			}
		}

		function handleReset() {
			stopInterpolation();
		}
		window.addEventListener('gymResetInterpolations', handleReset);

		function handleCloseOthers() {
			open = false;
		}
		window.addEventListener('gymCloseOtherInterpolations', handleCloseOthers);

		return () => {
			window.removeEventListener('gymResetInterpolations', handleReset);
			window.removeEventListener('gymCloseOtherInterpolations', handleCloseOthers);
			if (animFrameId !== null) {
				cancelAnimationFrame(animFrameId);
			}
		};
	});

	function handleClickOutside() {
		if (open) {
			open = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<span class="interp-menu-container">
	<button
		type="button"
		class="dots-btn"
		class:active
		on:click={toggleMenu}
		title="Interpolation mode"
	>
		<svg width="12" height="12" viewBox="0 0 12 12">
			<circle cx="6" cy="2" r="1.3" fill="currentColor" />
			<circle cx="6" cy="6" r="1.3" fill="currentColor" />
			<circle cx="6" cy="10" r="1.3" fill="currentColor" />
		</svg>
	</button>

	{#if open}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="interp-popup" on:click={(e) => e.stopPropagation()}>
			<div class="popup-header">
				<span class="popup-title">Interpolate</span>
				<button
					type="button"
					class="toggle-btn"
					class:running={active}
					on:click={() => (active ? stopInterpolation() : startInterpolation())}
				>
					{active ? '■ Stop' : '▶ Start'}
				</button>
			</div>

			{#if mode === 'text'}
				<div class="field-col">
					<span>Mode</span>
					<GymOverrideButtons 
						options={[
							{ label: 'Text', value: 'text' },
							{ label: 'Num', value: 'number' },
							{ label: 'Date', value: 'date' },
							{ label: 'Time', value: 'time' }
						]}
						activeValue={effectiveTextMode}
						optDefault=""
						onselect={(v) => { textModeOverride = v; }}
						onclear={() => { textModeOverride = null; }}
					/>
				</div>
			{/if}

			<label class="field">
				<span>CPM</span>
				<input type="number" bind:value={cpm} min={1} max={600} step={1} />
			</label>

			{#if mode === 'slider' || effectiveTextMode === 'text' || effectiveTextMode === 'number'}
				<label class="field">
					<span>{mode === 'text' && effectiveTextMode === 'text' ? 'Len Lo' : 'Min'}</span>
					<input
						type="number"
						bind:value={interpMin}
						step="any"
						on:input={() => {
							useCustomRange = true;
						}}
					/>
				</label>

				<label class="field">
					<span>{mode === 'text' && effectiveTextMode === 'text' ? 'Len Hi' : 'Max'}</span>
					<input
						type="number"
						bind:value={interpMax}
						step="any"
						on:input={() => {
							useCustomRange = true;
						}}
					/>
				</label>
			{/if}

			{#if effectiveTextMode === 'date' || effectiveTextMode === 'time'}
				<label class="field date-field">
					<span>Min</span>
					<input
						type="text"
						bind:value={interpMinDate}
						on:input={() => {
							useCustomDateRange = true;
						}}
					/>
				</label>
				
				<label class="field date-field">
					<span>Max</span>
					<input
						type="text"
						bind:value={interpMaxDate}
						on:input={() => {
							useCustomDateRange = true;
						}}
					/>
				</label>

				{#if effectiveTextMode === 'date'}
					<div class="field-col">
						<span>Format Rule</span>
						<GymOverrideButtons 
							options={[
								{ label: 'MM-DD', value: 'mm-dd' },
								{ label: 'DD-MM', value: 'dd-mm' }
							]}
							activeValue={effectiveDateFormat}
							optDefault=""
							onselect={(v) => { 
								dateFormatOverride = v; 
								useCustomDateRange = false;
							}}
							onclear={() => { 
								dateFormatOverride = null; 
								useCustomDateRange = false;
							}}
						/>
					</div>
				{/if}
			{/if}

		</div>
	{/if}
</span>

<style>
	.interp-menu-container {
		display: inline-flex;
		align-items: center;
		margin-right: 4px;
	}

	.dots-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		padding: 0;
		border: none;
		border-radius: 3px;
		background: transparent;
		color: #999;
		cursor: pointer;
		transition: all 0.15s ease;
		vertical-align: middle;
	}

	.dots-btn:hover {
		background: rgba(0, 0, 0, 0.08);
		color: #333;
	}

	.dots-btn.active {
		color: #e65100;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.interp-popup {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 2000;
		background: #fff;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 8px;
		min-width: 160px;
		font-size: 11px;
		margin-top: 2px;
	}

	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6px;
	}

	.popup-title {
		font-weight: 700;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #555;
	}

	.toggle-btn {
		padding: 2px 8px;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 4px;
		background: #f5f5f5;
		cursor: pointer;
		font-size: 10px;
		font-weight: 600;
		font-family: monospace;
		transition: all 0.15s ease;
	}

	.toggle-btn:hover {
		background: #eee;
	}

	.toggle-btn.running {
		background: #e65100;
		color: #fff;
		border-color: #bf360c;
	}

	.field {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
	}

	.field span {
		flex: 0 0 30px;
		font-weight: 600;
		color: #666;
		text-align: right;
		padding: 0;
	}

	.field input {
		flex: 1;
		width: 60px;
		padding: 2px 4px;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 3px;
		font-size: 11px;
		font-family: monospace;
		background: #fafafa;
	}
	
	.date-field input {
		width: 100px;
	}
	
	.field-col {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 8px;
	}
	
	.field-col span {
		font-weight: 600;
		color: #666;
	}
</style>
