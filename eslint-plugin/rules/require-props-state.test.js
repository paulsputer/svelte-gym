import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const rule = require('./require-props-state.cjs');

RuleTester.describe = (text, fn) => describe(text, fn);
RuleTester.it = (text, fn) => it(text, fn);

const ruleTester = new RuleTester({
	parserOptions: { ecmaVersion: 2022, sourceType: 'module' }
});

ruleTester.run('require-props-state', rule, {
	valid: [
		{
			name: 'props declared with $state and passed to restoreProps',
			code: `
				let props = $state({ name: 'hello' });
				restoreProps(props);
			`
		},
		{
			name: 'no restoreProps call at all',
			code: `
				let props = { name: 'hello' };
			`
		},
		{
			name: '$state used with different var, restoreProps uses that var',
			code: `
				let config = $state({ theme: 'dark' });
				restoreProps(config);
			`
		}
	],
	invalid: [
		{
			name: 'props declared without $state, passed to restoreProps',
			code: `
				let props = { name: 'hello' };
				restoreProps(props);
			`,
			errors: [{ messageId: 'propsNotState' }]
		},
		{
			name: 'props declared via function call (not $state), passed to restoreProps',
			code: `
				const props = getProps();
				restoreProps(props);
			`,
			errors: [{ messageId: 'propsNotState' }]
		},
		{
			name: 'one var uses $state but restoreProps called with different non-$state var',
			code: `
				let stateProps = $state({ a: 1 });
				let plainProps = { b: 2 };
				restoreProps(plainProps);
			`,
			errors: [{ messageId: 'propsNotState' }]
		}
	]
});
