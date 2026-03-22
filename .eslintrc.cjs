/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			},
			plugins: ['svelte-gym'],
			rules: {
				'svelte-gym/require-restore-props': 'warn',
				'svelte-gym/no-duplicate-prop-names': 'warn',
				'svelte-gym/require-props-state': 'error',
				'svelte-gym/single-component-in-test': 'error'
			}
		}
	]
};
