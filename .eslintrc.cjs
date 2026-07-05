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
				'svelte-gym/single-component-in-test': 'error',
				'svelte/valid-compile': ['error', { ignoreWarnings: true }]
			}
		},
		{
			files: ['src/routes/**/*.svelte'],
			rules: {
				'svelte-gym/single-component-in-test': 'off',
				'svelte-gym/require-restore-props': 'off'
			}
		},
		{
			files: [
				'src/lib/v4/**/*.svelte',
				'src/lib/v4/**/*.js',
				'src/lib/v4/**/*.ts',
				'test-v4-project/**/*.svelte',
				'test-v4-project/**/*.js',
				'test-v4-project/**/*.ts'
			],
			rules: {
				'svelte-gym/require-props-state': 'off',
				'svelte-gym/single-component-in-test': 'off',
				'svelte-gym/require-restore-props': 'off',
				'svelte-gym/no-duplicate-prop-names': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/ban-ts-comment': 'off',
				'@typescript-eslint/no-unused-vars': 'off',
				'no-empty': 'off',
				'svelte/valid-compile': 'off'
			}
		}
	]
};
