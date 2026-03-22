import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const rule = require('./require-restore-props.cjs');

RuleTester.describe = (text, fn) => describe(text, fn);
RuleTester.it = (text, fn) => it(text, fn);

const ruleTester = new RuleTester({
	parser: require.resolve('svelte-eslint-parser'),
	parserOptions: { ecmaVersion: 2022, sourceType: 'module' }
});

ruleTester.run('require-restore-props', rule, {
	valid: [
		{
			name: 'imports TestHarness and calls restoreProps',
			code: `
				<script>
					import { TestHarness, restoreProps } from 'svelte-gym';
					let props = { name: 'hello' };
					restoreProps(props);
				</script>
			`,
			filename: 'Test.svelte'
		},
		{
			name: 'no TestHarness import at all',
			code: `
				<script>
					import { onMount } from 'svelte';
					let x = 1;
				</script>
			`,
			filename: 'Test.svelte'
		},
		{
			name: 'imports from unrelated module',
			code: `
				<script>
					import { TestHarness } from 'other-lib';
				</script>
			`,
			filename: 'Test.svelte'
		}
	],
	invalid: [
		{
			name: 'imports TestHarness from svelte-gym but no restoreProps call',
			code: `
				<script>
					import { TestHarness } from 'svelte-gym';
					let props = { name: 'hello' };
				</script>
			`,
			filename: 'Test.svelte',
			errors: [{ messageId: 'missingRestoreProps' }]
		},
		{
			name: 'imports TestHarness via $lib path',
			code: `
				<script>
					import { TestHarness } from '$lib';
					let props = { name: 'hello' };
				</script>
			`,
			filename: 'Test.svelte',
			errors: [{ messageId: 'missingRestoreProps' }]
		},
		{
			name: 'imports TestHarness via $lib/index path',
			code: `
				<script>
					import { TestHarness } from '$lib/index';
					let props = { name: 'hello' };
				</script>
			`,
			filename: 'Test.svelte',
			errors: [{ messageId: 'missingRestoreProps' }]
		}
	]
});
