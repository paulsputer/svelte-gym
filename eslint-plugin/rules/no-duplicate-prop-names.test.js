import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const rule = require('./no-duplicate-prop-names.cjs');

RuleTester.describe = (text, fn) => describe(text, fn);
RuleTester.it = (text, fn) => it(text, fn);

const ruleTester = new RuleTester({
	parser: require.resolve('svelte-eslint-parser'),
	parserOptions: { ecmaVersion: 2022, sourceType: 'module' }
});

ruleTester.run('no-duplicate-prop-names', rule, {
	valid: [
		{
			name: 'two Gym components with unique names',
			code: `
				<GymCheckbox name="enabled" />
				<GymSlider name="opacity" />
			`,
			filename: 'Test.svelte'
		},
		{
			name: 'single Gym component',
			code: `
				<GymTextbox name="label" />
			`,
			filename: 'Test.svelte'
		},
		{
			name: 'duplicate names with __ prefix are skipped (harness-internal)',
			code: `
				<GymCheckbox name="__internal" />
				<GymSlider name="__internal" />
			`,
			filename: 'Test.svelte'
		},
		{
			name: 'non-Gym components with duplicate names are ignored',
			code: `
				<input name="foo" />
				<input name="foo" />
			`,
			filename: 'Test.svelte'
		}
	],
	invalid: [
		{
			name: 'two GymCheckbox with same name',
			code: `
				<GymCheckbox name="enabled" />
				<GymCheckbox name="enabled" />
			`,
			filename: 'Test.svelte',
			errors: [{ messageId: 'duplicatePropName' }]
		},
		{
			name: 'GymCheckbox and GymSlider sharing the same name',
			code: `
				<GymCheckbox name="value" />
				<GymSlider name="value" />
			`,
			filename: 'Test.svelte',
			errors: [{ messageId: 'duplicatePropName' }]
		},
		{
			name: 'three components with same name produces two errors',
			code: `
				<GymCheckbox name="x" />
				<GymSlider name="x" />
				<GymDropdown name="x" />
			`,
			filename: 'Test.svelte',
			errors: [
				{ messageId: 'duplicatePropName' },
				{ messageId: 'duplicatePropName' }
			]
		}
	]
});
