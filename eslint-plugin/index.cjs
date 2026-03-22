/**
 * eslint-plugin-svelte-gym
 *
 * Custom ESLint rules for validating svelte-gym test harness pages.
 * These rules help catch common setup mistakes at lint time.
 */

const requireRestoreProps = require('./rules/require-restore-props.cjs');
const noDuplicatePropNames = require('./rules/no-duplicate-prop-names.cjs');
const requirePropsState = require('./rules/require-props-state.cjs');
const singleComponentInTest = require('./rules/single-component-in-test.cjs');

module.exports = {
	rules: {
		'require-restore-props': requireRestoreProps,
		'no-duplicate-prop-names': noDuplicatePropNames,
		'require-props-state': requirePropsState,
		'single-component-in-test': singleComponentInTest
	},
	configs: {
		recommended: {
			plugins: ['svelte-gym'],
			rules: {
				'svelte-gym/require-restore-props': 'warn',
				'svelte-gym/no-duplicate-prop-names': 'warn',
				'svelte-gym/require-props-state': 'error',
				'svelte-gym/single-component-in-test': 'error'
			}
		}
	}
};
