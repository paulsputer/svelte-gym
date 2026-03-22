/**
 * Rule: require-props-state
 *
 * Errors when restoreProps(props) is called but `props` was not declared
 * with $state(). Without $state, URL-restored values won't trigger
 * Svelte reactivity.
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require that the props object passed to restoreProps() is declared with $state()',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [],
		messages: {
			propsNotState:
				'restoreProps({{name}}) is called but "{{name}}" was not declared with $state(). ' +
				'Without $state(), URL parameters will be set but won\'t trigger reactive updates. ' +
				'Use: let {{name}} = $state({ ... })'
		}
	},
	create(context) {
		// Track variable declarations that use $state()
		const stateVars = new Set();
		// Track restoreProps calls and their argument names
		const restorePropsCalls = [];

		return {
			VariableDeclarator(node) {
				// Detect: let props = $state({ ... })
				if (
					node.init &&
					node.init.type === 'CallExpression' &&
					node.init.callee.type === 'Identifier' &&
					node.init.callee.name === '$state' &&
					node.id.type === 'Identifier'
				) {
					stateVars.add(node.id.name);
				}
			},
			CallExpression(node) {
				// Detect: restoreProps(props)
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'restoreProps' &&
					node.arguments.length > 0 &&
					node.arguments[0].type === 'Identifier'
				) {
					restorePropsCalls.push({
						node,
						argName: node.arguments[0].name
					});
				}
			},
			'Program:exit'() {
				for (const { node, argName } of restorePropsCalls) {
					if (!stateVars.has(argName)) {
						context.report({
							node,
							messageId: 'propsNotState',
							data: { name: argName }
						});
					}
				}
			}
		};
	}
};
