<script lang="ts">
	import 'ress';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { restoreProps } from './helpers.js';
	import { onMount } from 'svelte';

	import GymCheckbox from './GymCheckbox.svelte';
	import GymSlider from './GymSlider.svelte';
	import GymButton from './GymButton.svelte';
	import GymDropdown from './GymDropdown.svelte';

	export let maxWidth: number | null = null;
	export let maxHeight: number | null = null;
	export let maxFontSize: number | null = null;

	let props = {
		__controls: true,
		__grid: true,
		__highlight: true,
		__width: 'auto',
		__height: 'auto',
		__fontsize: '1em',
		__resetAnimations: () => {}
	};

	const gridOptions = [
		{ value: 'none', class: 'no-grid' },
		{ value: 'light', class: 'grid-basic-light' },
		{ value: 'dark', class: 'grid-basic-dark' },
		{ value: 'black', class: 'grid-black-grid-white-bg' },
		{ value: 'white', class: 'grid-white-grid-black-bg' },
		{ value: 'textBlack', class: 'grid-black-text-white-bg' },
		{ value: 'textWhite', class: 'grid-white-text-black-bg' }
	];

	function getGridClassFromValue(v) {
		// support legacy mode was boolean
		if (v === true || v === 'true') {
			return getGridClassFromValue('light');
		} else if (v === false || v === 'false') {
			return getGridClassFromValue('none');
		}

		const g = gridOptions.filter((e) => e.value === v);

		if (g.length > 0) {
			return g[0].class;
		}

		return getGridClassFromValue('none');
	}

	onMount(() => {
		let hasAnimations = document.getAnimations().length > 0;
		// @ts-ignore
		props.__resetAnimations = hasAnimations ? resetAnimations : undefined;
	});

	function resetAnimations() {
		console.info('Svelte-Gym: Animations Reset');
		document.getAnimations().forEach((a) => {
			a.cancel();
			a.play();
		});
	}

	function gotoPermalink() {
		goto($page.url.toString());
	}

	restoreProps(props);
</script>

<section>
	<div class="test-grid {getGridClassFromValue(props.__grid)}"></div>

	<div class="test-area" class:controls={props.__controls}>
		<div class="test-holder">
			<div
				class="test-component"
				class:highlight={props.__highlight}
				style="
				--w:{props.__width};
				--h:{props.__height};
				--fs:{props.__fontsize}"
			>
				<slot name="componentToTest" />
			</div>
		</div>
		{#if props.__controls}
			<div class="test-controls">
				<span><a href="#" on:click={gotoPermalink}>Generate Permalink</a></span>

				<hr />
				<br />
				<ul>
					<li><GymCheckbox hideExtra={true} bind:props name="__controls" label="controls" /></li>
					<GymDropdown
						hideExtra={true}
						bind:props
						name="__grid"
						label="grid"
						options={gridOptions}
						optLabel="value"
						optValue="value"
					/>
					<li><GymCheckbox hideExtra={true} bind:props name="__highlight" label="highlight" /></li>
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
				<GymSlider
					hideExtra={true}
					units="px"
					max={maxFontSize}
					bind:props
					name="__fontsize"
					label="fontsize"
				/>

				<br />
				<hr />
				<span>
					<slot name="controls" />
				</span>
			</div>
		{/if}
	</div>
</section>

<style>
	section hr {
		border-color: #999;
	}
	.test-controls a,
	.test-controls a:visited {
		color: #000;
		text-decoration: underline;
	}

	.test-grid {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: -900;
	}

	.test-area {
		grid-template-columns: 1fr;
	}

	.test-area.controls {
		display: grid;
		grid-template-columns: 1fr 25em;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
	}

	.test-holder {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	section {
		height: 100vh;
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
	}

	.highlight {
		background: yellow;
	}

	.test-controls {
		display: flex;
		flex-direction: column;
		background: #ccc;
		height: 100vh;
		font-family: monospace;
		color: #000;
		overflow: scroll;
	}

	.test-controls span {
		padding: 0.5em;
	}

	ul {
		list-style-type: none;
		padding-left: 1em;
	}

	.grid-basic-light {
		background:
			linear-gradient(#eee 1px, transparent 0) repeat-y,
			linear-gradient(90deg, #eee 1px, transparent 0) repeat-x,
			white;
		background-size: 20px 20px;
		background-position:
			0 0,
			10px 10px;
		background-repeat: repeat, repeat;
	}

	.grid-basic-dark {
		background:
			linear-gradient(#aaa 1px, transparent 0) repeat-y,
			linear-gradient(90deg, #aaa 1px, transparent 0) repeat-x,
			white;
		background-size: 20px 20px;
		background-position:
			0 0,
			10px 10px;
		background-repeat: repeat, repeat;
	}
	.grid-black-grid-white-bg {
		background:
			linear-gradient(black 1px, transparent 0) repeat-y,
			linear-gradient(90deg, black 1px, transparent 0) repeat-x,
			white;
		background-size: 20px 20px;
		background-position:
			0 0,
			10px 10px;
		background-repeat: repeat, repeat;
	}

	.grid-white-grid-black-bg {
		background:
			linear-gradient(white 1px, transparent 0) repeat-y,
			linear-gradient(90deg, white 1px, transparent 0) repeat-x,
			black;
		background-size: 20px 20px;
		background-position:
			0 0,
			10px 10px;
		background-repeat: repeat, repeat;
	}

	.grid-black-text-white-bg {
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="black" font-family="Arial">Lorem ipsum</text></svg>');
		background-repeat: repeat;
		background-size: 140px 30px;
		background-color: white;
	}

	.grid-white-text-black-bg {
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" viewBox="0 0 45 10"><text x="0" y="8" font-size="8" fill="white" font-family="Arial">Lorem ipsum</text></svg>');
		background-repeat: repeat;
		background-size: 140px 30px;
		background-color: black;
	}
</style>
