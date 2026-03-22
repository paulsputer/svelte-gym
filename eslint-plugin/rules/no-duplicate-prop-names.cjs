/**
 * Rule: no-duplicate-prop-names
 *
 * Warns when multiple Gym* components use the same `name` prop value,
 * which causes permalink parameter collisions.
 */

const GYM_COMPONENTS = new Set([
	'GymCheckbox',
	'GymSlider',
	'GymTextbox',
	'GymDropdown',
	'GymRadioGroup',
	'GymColorPicker',
	'GymButton'
]);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow duplicate name props across Gym* components (causes permalink collisions)',
			category: 'Best Practices',
			recommended: true
		},
		schema: [],
		messages: {
			duplicatePropName:
				'Duplicate name "{{name}}" used on multiple Gym components. ' +
				'Each Gym component should have a unique name to avoid permalink parameter collisions.'
		}
	},
	create(context) {
		// Map of name value -> array of AST nodes using that name
		const nameUsages = new Map();

		return {
			// Handle Svelte template elements: <GymCheckbox name="foo" />
			// svelte-eslint-parser provides SvelteElement nodes
			SvelteElement(node) {
				if (!node.name || !node.name.name) return;

				const componentName =
					typeof node.name.name === 'string' ? node.name.name : node.name.name;

				if (!GYM_COMPONENTS.has(componentName)) return;

				// Find the `name` attribute
				for (const attr of node.startTag.attributes) {
					if (
						attr.type === 'SvelteAttribute' &&
						attr.key &&
						attr.key.name === 'name'
					) {
						// Get the string value
						let nameValue = null;
						if (attr.value && attr.value.length > 0) {
							const firstVal = attr.value[0];
							if (firstVal.type === 'SvelteLiteral') {
								nameValue = firstVal.value;
							}
						}

						if (nameValue && !nameValue.startsWith('__')) {
							// Skip harness-internal props (prefixed with __)
							if (!nameUsages.has(nameValue)) {
								nameUsages.set(nameValue, []);
							}
							nameUsages.get(nameValue).push(attr);
						}
					}
				}
			},
			'Program:exit'() {
				for (const [name, nodes] of nameUsages) {
					if (nodes.length > 1) {
						// Report on all but the first occurrence
						for (let i = 1; i < nodes.length; i++) {
							context.report({
								node: nodes[i],
								messageId: 'duplicatePropName',
								data: { name }
							});
						}
					}
				}
			}
		};
	}
};
