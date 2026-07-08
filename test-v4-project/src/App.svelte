<script lang="ts">
	import {
		TestHarness,
		restoreProps,
		GymCheckbox,
		GymTextbox,
		GymSlider,
		GymDropdown,
		GymRadioGroup,
		GymColorPicker
	} from 'svelte-gym/v4';
	import ExampleButton from './lib/ExampleButton.svelte';

	// Simple router based on window.location.pathname
	let path = typeof window !== 'undefined' ? window.location.pathname : '/';

	// State for Kitchen Sink
	let kitchenSinkLog: string[] = [];
	let kitchenSinkProps = {
		label: 'Kitchen Sink (Svelte 4)',
		description: 'A long description\nthat spans multiple lines.',
		isActive: true,
		count: 5,
		offset: 0,
		settings: {
			theme: 'light',
			notifications: {
				email: true,
				push: false
			}
		},
		selection: 'Option A',
		radioSelection: 'radio1',
		accentColor: '#3b82f6',
		numericString: '123.45',
		isoDate: '2024-12-01T10:00:00Z',
		usDate: '12-01-2024',
		clickMe: () => {
			kitchenSinkLog = [`Clicked at ${new Date().toLocaleTimeString()}`, ...kitchenSinkLog];
		}
	};

	// State for Example Button (Base Page)
	let buttonLog: string[] = [];
	let buttonProps = {
		label: 'default text',
		active: true,
		spinner: false,
		onclick: () => {
			const entry = `click event @ ${new Date().toUTCString()}`;
			buttonLog = [entry, ...buttonLog];
		}
	};

	// Derive individual props reactively so ExampleButton updates correctly.
	// Svelte 4 doesn't re-evaluate {...obj} on nested property mutation,
	// but $: derivations on individual properties DO track changes from bind:.
	$: buttonLabel = buttonProps.label;
	$: buttonActive = buttonProps.active;
	$: buttonSpinner = buttonProps.spinner;
	$: buttonOnclick = buttonProps.onclick;

	if (typeof window !== 'undefined') {
		if (path === '/kitchen-sink') {
			restoreProps(kitchenSinkProps);
		} else {
			restoreProps(buttonProps);
		}
	}
</script>

{#if path === '/kitchen-sink'}
	<TestHarness log={kitchenSinkLog}>
		<div
			slot="componentToTest"
			class="demo-component"
			class:dark={kitchenSinkProps.settings.theme === 'dark'}
		>
			<h1>{kitchenSinkProps.label}</h1>
			<p style="white-space: pre-wrap;">{kitchenSinkProps.description}</p>
			<p>Status: {kitchenSinkProps.isActive ? 'Active' : 'Inactive'}</p>
			<p>Count: {kitchenSinkProps.count}</p>
			<p>Offset: {kitchenSinkProps.offset}</p>
			<p>Theme: {kitchenSinkProps.settings.theme}</p>
			<p>
				Notifications: {kitchenSinkProps.settings.notifications.email ? 'Email' : ''}
				{kitchenSinkProps.settings.notifications.push ? 'Push' : ''}
			</p>
			<p>Selection: {kitchenSinkProps.selection}</p>
			<p>Radio: {kitchenSinkProps.radioSelection}</p>
			<p>
				Accent Color:
				<span
					style="display:inline-block; width:1em; height:1em; background-color:{kitchenSinkProps.accentColor};"
				></span>
				{kitchenSinkProps.accentColor}
			</p>
			<p>Numeric String: {kitchenSinkProps.numericString}</p>
			<p>ISO Date: {kitchenSinkProps.isoDate}</p>
			<p>US Date: {kitchenSinkProps.usDate}</p>
			<button on:click={kitchenSinkProps.clickMe}>Click Me</button>
		</div>

		<div slot="controls">
			<h3>Basic Types</h3>
			<ul>
				<li><GymTextbox bind:props={kitchenSinkProps} name="label" label="Label Text" /></li>
				<li><GymTextbox bind:props={kitchenSinkProps} name="description" label="Description" multiline={true}/></li>
				<li><GymTextbox bind:props={kitchenSinkProps} name="numericString" label="Numeric String" /></li>
				<li><GymTextbox bind:props={kitchenSinkProps} name="isoDate" label="ISO Date" /></li>
				<li><GymTextbox bind:props={kitchenSinkProps} name="usDate" label="US Date" /></li>
				<li><GymCheckbox bind:props={kitchenSinkProps} name="isActive" label="Is Active?" /></li>
				<li><GymSlider bind:props={kitchenSinkProps} name="count" min={0} max={10} label="Count" /></li>
				<li><GymSlider bind:props={kitchenSinkProps} name="offset" min={-20} max={20} label="Offset" /></li>
			</ul>

			<h3>Nested Properties (JSON Path)</h3>
			<ul>
				<li>
					<GymDropdown
						bind:props={kitchenSinkProps}
						name="settings.theme"
						options={['light', 'dark', 'system']}
						label="Theme"
					/>
				</li>
				<li>
					<GymCheckbox
						bind:props={kitchenSinkProps}
						name="settings.notifications.email"
						label="Email Notifs"
					/>
				</li>
				<li>
					<GymCheckbox
						bind:props={kitchenSinkProps}
						name="settings.notifications.push"
						label="Push Notifs"
					/>
				</li>
			</ul>

			<h3>Selection</h3>
			<ul>
				<li>
					<GymDropdown
						bind:props={kitchenSinkProps}
						name="selection"
						options={['Option A', 'Option B', 'Option C']}
						label="Dropdown"
					/>
				</li>
				<li>
					<GymRadioGroup
						bind:props={kitchenSinkProps}
						name="radioSelection"
						options={['radio1', 'radio2', 'radio3']}
						label="Radio Group"
					/>
				</li>
				<li>
					<GymColorPicker bind:props={kitchenSinkProps} name="accentColor" label="Accent Color" />
				</li>
			</ul>
		</div>
	</TestHarness>
{:else}
	<TestHarness log={buttonLog}>
		<div slot="componentToTest">
			<ExampleButton
				label={buttonLabel}
				active={buttonActive}
				spinner={buttonSpinner}
				onclick={buttonOnclick}
			></ExampleButton>
		</div>

		<div slot="controls">
			<ul>
				<li><GymCheckbox bind:props={buttonProps} name="active" /></li>
				<li><GymCheckbox bind:props={buttonProps} name="spinner" /></li>
			</ul>
			<div>
				<GymTextbox bind:props={buttonProps} name="label" />
			</div>
		</div>
	</TestHarness>
{/if}

<style>
	:root {
		--primary: #c30;
		--primary-inverted: #201c1b;
		--primary-inactive: #eee;
	}

	.demo-component {
		padding: 2rem;
		border: 2px solid #ccc;
		border-radius: 8px;
		background: white;
		color: black;
		transition: all 0.3s ease;
	}

	.demo-component.dark {
		background: #333;
		color: white;
		border-color: #666;
	}

	h1 {
		margin-top: 0;
	}

	button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}
	h3 {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid #eee;
	}
	ul {
		list-style-type: none;
		padding-left: 1em;
	}
	li {
		margin-bottom: 0.5rem;
	}
</style>
