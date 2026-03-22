/**
 * Rule: require-restore-props
 *
 * Warns when a Svelte file imports TestHarness from svelte-gym
 * but does not call restoreProps() anywhere in the script block.
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Require restoreProps() call when TestHarness is imported from svelte-gym',
			category: 'Best Practices',
			recommended: true
		},
		schema: [],
		messages: {
			missingRestoreProps:
				'TestHarness is imported but restoreProps() is never called. ' +
				'Without restoreProps(), URL parameters will not be restored into component state. ' +
				'Add: restoreProps(props) in your script block.'
		}
	},
	create(context) {
		let hasTestHarnessImport = false;
		let testHarnessImportNode = null;
		let hasRestorePropsCall = false;

		return {
			ImportDeclaration(node) {
				const source = node.source.value;
				if (source === 'svelte-gym' || source === '$lib' || source === '$lib/index' ||
					source.endsWith('/TestHarness.svelte')) {
					for (const specifier of node.specifiers) {
						if (
							(specifier.type === 'ImportSpecifier' &&
								specifier.imported.name === 'TestHarness') ||
							(specifier.type === 'ImportDefaultSpecifier' &&
								specifier.local.name === 'TestHarness')
						) {
							hasTestHarnessImport = true;
							testHarnessImportNode = node;
						}
					}
				}
			},
			CallExpression(node) {
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'restoreProps'
				) {
					hasRestorePropsCall = true;
				}
			},
			'Program:exit'() {
				if (hasTestHarnessImport && !hasRestorePropsCall && testHarnessImportNode) {
					context.report({
						node: testHarnessImportNode,
						messageId: 'missingRestoreProps'
					});
				}
			}
		};
	}
};
