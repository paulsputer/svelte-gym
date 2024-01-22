<script lang="ts">
	import 'ress';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { stringToBool } from './helpers.js';

	import GymCheckbox from './GymCheckbox.svelte';
	import GymSlider from './GymSlider.svelte';

	export let maxWidth = 500;
	export let maxHeight = 500;
	export let maxFontSize = 50;

	let params = $page.url.searchParams;

	let props = {
		__controls: stringToBool(params.get('__controls')) ?? true,
		__grid: stringToBool(params.get('__grid')) ?? true,
		__highlight: stringToBool(params.get('__highlight')) ?? true,
		__width: params.get('__width') || 'auto',
		__height: params.get('__height') || 'auto',
		__fontsize: params.get('__fontsize') || '1em'
	};

	function gotoPermalink() {
		goto($page.url.toString());
	}
</script>

<section>
	<div class="test-grid" class:grid={props.__grid}></div>

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
					<li><GymCheckbox bind:props name="__controls" label="controls" /></li>
					<li><GymCheckbox bind:props name="__grid" label="grid" /></li>
					<li><GymCheckbox bind:props name="__highlight" label="highlight" /></li>
				</ul>

				<br />
				<GymSlider units="px" min={0} max={maxWidth} bind:props name="__width" label="width" />
				<GymSlider units="px" min={0} max={maxHeight} bind:props name="__height" label="height" />
				<GymSlider
					units="px"
					min={5}
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
	.test-grid.grid {
		visibility: visible;
	}

	.test-controls a,
	.test-controls a:visited {
		color: #000;
		text-decoration: underline;
	}

	.test-grid {
		visibility: hidden;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		background-image: linear-gradient(to right, grey 1px, transparent 1px),
			linear-gradient(to bottom, grey 1px, transparent 1px);
		background-size: 20px 20px;
		background-position:
			0 0,
			10px 10px;
		background-repeat: repeat, repeat;
		z-index: -100;
		opacity: 0.1;
	}

	.test-grid::before,
	.test-grid::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: linear-gradient(to right, black 1px, transparent 1px),
			linear-gradient(to bottom, black 1px, transparent 1px);
		background-position: 0 0;
		background-size: 10px 10px;
		z-index: -1;
		opacity: 0.1;
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
	}

	.test-controls span {
		padding: 0.5em;
	}

	ul {
		list-style-type: none;
		padding-left: 1em;
	}
</style>
