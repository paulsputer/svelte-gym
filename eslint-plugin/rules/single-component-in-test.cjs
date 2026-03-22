/**
 * Rule: single-component-in-test
 *
 * Errors when the componentToTest snippet contains more than one child
 * element, or when its child is a plain HTML element (not a component).
 *
 * This enforces testing components in isolation, preventing wrapper divs
 * that make things look right in the harness but behave differently in
 * production.
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require componentToTest snippet to contain exactly one component element',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [],
		messages: {
			multipleChildren:
				'componentToTest snippet should contain exactly one element, found {{count}}. ' +
				'Testing multiple elements in the harness may hide layout issues.',
			htmlElementInTest:
				'componentToTest snippet should contain a component (PascalCase), not a plain HTML element <{{tag}}>. ' +
				'Wrapping components in HTML elements like <div> or <section> makes them look correct ' +
				'in the harness but may behave differently in production.'
		}
	},
	create(context) {
		return {
			// svelte-eslint-parser provides SvelteSnippetBlock for {#snippet ...}
			SvelteSnippetBlock(node) {
				// Check if this is the componentToTest snippet
				if (!node.id || node.id.name !== 'componentToTest') return;

				// Get the children — filter to actual elements (skip whitespace text nodes)
				const children = (node.children || []).filter((child) => {
					if (child.type === 'SvelteElement') return true;
					if (child.type === 'SvelteText' || child.type === 'SvelteLiteral') {
						// Skip pure whitespace text nodes
						return child.value && child.value.trim().length > 0;
					}
					return child.type !== 'SvelteText';
				});

				if (children.length === 0) return;

				// Check: more than one element
				const elements = children.filter((c) => c.type === 'SvelteElement');
				if (elements.length > 1) {
					context.report({
						node,
						messageId: 'multipleChildren',
						data: { count: String(elements.length) }
					});
					return;
				}

				// Check: the single element should be a component (PascalCase), not HTML
				if (elements.length === 1) {
					const el = elements[0];
					const tagName =
						el.name && typeof el.name.name === 'string' ? el.name.name : null;
					if (tagName) {
						// HTML elements are lowercase, components are PascalCase
						const isComponent = /^[A-Z]/.test(tagName);
						if (!isComponent) {
							context.report({
								node: el,
								messageId: 'htmlElementInTest',
								data: { tag: tagName }
							});
						}
					}
				}
			}
		};
	}
};
