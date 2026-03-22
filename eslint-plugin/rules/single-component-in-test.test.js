import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const rule = require('./single-component-in-test.cjs');

RuleTester.describe = (text, fn) => describe(text, fn);
RuleTester.it = (text, fn) => it(text, fn);

const ruleTester = new RuleTester({
	parser: require.resolve('svelte-eslint-parser'),
	parserOptions: { ecmaVersion: 2022, sourceType: 'module' }
});

ruleTester.run('single-component-in-test', rule, {
	valid: [
		{
			name: 'snippet with single PascalCase component',
			code: `
				{#snippet componentToTest()}
					<MyComponent />
				{/snippet}
			`,
			filename: 'Test.svelte'
		},
		{
			name: 'snippet named something other than componentToTest',
			code: `
				{#snippet otherSnippet()}
					<div>anything</div>
					<span>goes</span>
				{/snippet}
			`,
			filename: 'Test.svelte'
		},
		{
			name: 'empty componentToTest snippet',
			code: `
				{#snippet componentToTest()}
				{/snippet}
			`,
			filename: 'Test.svelte'
		}
	],
	invalid: [
		{
			name: 'snippet with multiple elements',
			code: `
				{#snippet componentToTest()}
					<MyComponent />
					<OtherComponent />
				{/snippet}
			`,
			filename: 'Test.svelte',
			errors: [{ messageId: 'multipleChildren' }]
		},
		{
			name: 'snippet with a plain HTML div element',
			code: `
				{#snippet componentToTest()}
					<div>wrapped</div>
				{/snippet}
			`,
			filename: 'Test.svelte',
			errors: [{ messageId: 'htmlElementInTest' }]
		},
		{
			name: 'snippet with a plain HTML section element',
			code: `
				{#snippet componentToTest()}
					<section>wrapped</section>
				{/snippet}
			`,
			filename: 'Test.svelte',
			errors: [{ messageId: 'htmlElementInTest' }]
		}
	]
});
