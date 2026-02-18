<script>
	import {
		TestHarness,
		restoreProps,
		GymCheckbox,
		GymTextbox,
		GymSlider,
		GymDropdown,
		GymRadioGroup,
		GymLog
	} from '$lib';

	/** @type {string[]} */
	let log = [];

	let props = $state({
		label: 'Kitchen Sink',
		description: 'A long description\nthat spans multiple lines.',
		isActive: true,
		count: 5,
		settings: {
			theme: 'light',
			notifications: {
				email: true,
				push: false
			}
		},
		selection: 'Option A',
		radioSelection: 'radio1',
		clickMe: () => {
			log = [`Clicked at ${new Date().toLocaleTimeString()}`, ...log];
		}
	});

	$effect.pre(() => {
		restoreProps(props);
	});
</script>

<TestHarness>
	{#snippet componentToTest()}
		<div class="demo-component" class:dark={props.settings.theme === 'dark'}>
			<h1>{props.label}</h1>
			<p style="white-space: pre-wrap;">{props.description}</p>
			<p>Status: {props.isActive ? 'Active' : 'Inactive'}</p>
			<p>Count: {props.count}</p>
			<p>Theme: {props.settings.theme}</p>
			<p>
				Notifications: {props.settings.notifications.email ? 'Email' : ''}
				{props.settings.notifications.push ? 'Push' : ''}
			</p>
			<p>Selection: {props.selection}</p>
			<p>Radio: {props.radioSelection}</p>
			<button on:click={props.clickMe}>Log Interaction</button>
		</div>
	{/snippet}

	{#snippet controls()}
		<h3>Basic Types</h3>
		<ul>
			<li><GymTextbox bind:props name="label" label="Label Text" /></li>
			<li><GymTextbox bind:props name="description" label="Description" multiline={true} /></li>
			<li><GymCheckbox bind:props name="isActive" label="Is Active?" /></li>
			<li><GymSlider bind:props name="count" min={0} max={10} label="Count" /></li>
		</ul>

		<h3>Nested Properties (JSON Path)</h3>
		<ul>
			<li>
				<GymDropdown
					bind:props
					name="settings.theme"
					options={['light', 'dark', 'system']}
					label="Theme"
				/>
			</li>
			<li><GymCheckbox bind:props name="settings.notifications.email" label="Email Notifs" /></li>
			<li><GymCheckbox bind:props name="settings.notifications.push" label="Push Notifs" /></li>
		</ul>

		<h3>Selection</h3>
		<ul>
			<li>
				<GymDropdown
					bind:props
					name="selection"
					options={['Option A', 'Option B', 'Option C']}
					label="Dropdown"
				/>
			</li>
			<li>
				<GymRadioGroup
					bind:props
					name="radioSelection"
					options={['radio1', 'radio2', 'radio3']}
					label="Radio Group"
				/>
			</li>
		</ul>

		<h3>Logs</h3>
		<GymLog {log} />
	{/snippet}
</TestHarness>

<style>
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
		list-style: none;
		padding-left: 0;
	}
	li {
		margin-bottom: 0.5rem;
	}
</style>
