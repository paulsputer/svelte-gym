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
		controls: stringToBool(params.get('controls')) ?? true,
		grid: stringToBool(params.get('grid')) ?? true,
		highlight: stringToBool(params.get('highlight')) ?? true,
		width: params.get('width') || 'auto',
		height: params.get('height') || 'auto',
		fontsize: params.get('fontsize') || '1em'
	};

	function gotoPermalink() {
		goto($page.url.toString());
	}
</script>

<section>
	<div class="test-grid" class:grid={props.grid}></div>

	<div class="test-area" class:controls={props.controls}>
		<div class="test-holder">
			<div
				class="test-component"
				class:highlight={props.highlight}
				style="
				--w:{props.width};
				--h:{props.height};
				--fs:{props.fontsize}"
			>
				<slot name="componentToTest" />
			</div>
		</div>
		{#if props.controls}
			<div class="test-controls">
				<span><a href="#" on:click={gotoPermalink}>Generate Permalink</a></span>

				<hr />
				<br />
				<ul>
					<li><GymCheckbox bind:props name="controls" /></li>
					<li><GymCheckbox bind:props name="grid" /></li>
					<li><GymCheckbox bind:props name="highlight" /></li>
				</ul>

				<br />
				<GymSlider units="px" min={0} max={maxWidth} bind:props name="width" />
				<GymSlider units="px" min={0} max={maxHeight} bind:props name="height" />
				<GymSlider units="px" min={5} max={maxFontSize} bind:props name="fontsize" />

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
