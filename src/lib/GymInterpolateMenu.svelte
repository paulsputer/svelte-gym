<script lang="ts">
	import { onMount } from 'svelte';
	import { setProp } from './helpers.js';

	interface GymInterpolateMenuProps {
		mode: 'slider' | 'text';
		multiline?: boolean;
		sliderMin?: number;
		sliderMax?: number;
		sliderValue?: number;
		units?: string | null;
		propName: string;
		props: Record<string, any>;
	}

	let {
		mode,
		multiline = false,
		sliderMin = 0,
		sliderMax = 100,
		sliderValue = 50,
		units = null,
		propName,
		props = $bindable()
	}: GymInterpolateMenuProps = $props();

	let open = $state(false);
	let active = $state(false);
	let animFrameId: number | null = $state(null);
	let startTime: number = 0;

	// Interpolation config
	let cpm = $state(20);
	let interpMin = $state(0);
	let interpMax = $state(100);
	let useCustomRange = $state(false);

	// Lorem ipsum for text mode
	const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra.`;

	// Derive defaults from slider props
	$effect(() => {
		if (mode === 'slider' && !useCustomRange) {
			interpMin = sliderMin;
			interpMax = sliderMax;
		} else if (mode === 'text' && !useCustomRange) {
			interpMin = 0;
			interpMax = multiline ? 500 : 120;
		}
	});

	function getEffectiveMin() {
		return useCustomRange ? interpMin : (mode === 'slider' ? sliderMin : 0);
	}

	function getEffectiveMax() {
		return useCustomRange ? interpMax : (mode === 'slider' ? sliderMax : (multiline ? 500 : 120));
	}

	function toggleMenu(e: MouseEvent) {
		e.stopPropagation();
		open = !open;
	}

	function startInterpolation() {
		if (active) return;
		active = true;
		startTime = performance.now();

		function animate(now: number) {
			if (!active) return;
			const elapsed = (now - startTime) / 1000;
			const frequency = cpm / 60;
			const sine = 0.5 + 0.5 * Math.sin(2 * Math.PI * frequency * elapsed);

			const eMin = getEffectiveMin();
			const eMax = getEffectiveMax();

			if (mode === 'slider') {
				const value = eMin + (eMax - eMin) * sine;
				const rounded = Math.round(value);
				setProp(rounded, propName, props, units ?? undefined);
			} else {
				// Text mode: grow/shrink lorem ipsum
				const len = Math.floor(eMin + (eMax - eMin) * sine);
				// Build text from lorem, repeating if needed
				let text = '';
				while (text.length < len) {
					text += LOREM;
				}
				text = text.slice(0, len);
				setProp(text, propName, props);
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

	// Permalink integration: store interpolation config as URL params
	function updatePermalink() {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		const config = JSON.stringify({
			mode,
			cpm,
			min: getEffectiveMin(),
			max: getEffectiveMax(),
			multiline
		});
		url.searchParams.set(`__interp_${propName}`, config);
		history.replaceState(null, '', url);
	}

	function removePermalink() {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		url.searchParams.delete(`__interp_${propName}`);
		history.replaceState(null, '', url);
	}

	// Restore from permalink on mount + listen for global reset
	onMount(() => {
		// Restore interpolation config from URL
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
				// Auto-start from permalink
				startInterpolation();
			} catch {
				// ignore bad config
			}
		}

		// Listen for global reset (fired by TestHarness "Reset Animations")
		function handleReset() {
			stopInterpolation();
		}
		window.addEventListener('gymResetInterpolations', handleReset);

		return () => {
			window.removeEventListener('gymResetInterpolations', handleReset);
			if (animFrameId !== null) {
				cancelAnimationFrame(animFrameId);
			}
		};
	});
	// Close menu when clicking outside
	function handleClickOutside(e: MouseEvent) {
		if (open) {
			open = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<span class="interp-menu-container">
	<button
		type="button"
		class="dots-btn"
		class:active
		onclick={toggleMenu}
		title="Interpolation mode"
	>
		<svg width="12" height="12" viewBox="0 0 12 12">
			<circle cx="6" cy="2" r="1.3" fill="currentColor" />
			<circle cx="6" cy="6" r="1.3" fill="currentColor" />
			<circle cx="6" cy="10" r="1.3" fill="currentColor" />
		</svg>
	</button>

	{#if open}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="interp-popup" onclick={(e) => e.stopPropagation()}>
			<div class="popup-header">
				<span class="popup-title">Interpolate</span>
				<button
					type="button"
					class="toggle-btn"
					class:running={active}
					onclick={() => active ? stopInterpolation() : startInterpolation()}
				>
					{active ? '■ Stop' : '▶ Start'}
				</button>
			</div>

			<label class="field">
				<span>CPM</span>
				<input type="number" bind:value={cpm} min={1} max={600} step={1} />
			</label>

			<label class="field">
				<span>Min</span>
				<input type="number" bind:value={interpMin} step={1}
					oninput={() => { useCustomRange = true; }} />
			</label>

			<label class="field">
				<span>Max</span>
				<input type="number" bind:value={interpMax} step={1}
					oninput={() => { useCustomRange = true; }} />
			</label>
		</div>
	{/if}
</span>

<style>
	.interp-menu-container {
		position: relative;
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
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
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
		margin-bottom: 4px;
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
</style>
