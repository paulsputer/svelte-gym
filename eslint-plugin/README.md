# eslint-plugin-svelte-gym

ESLint rules for validating [svelte-gym](https://github.com/paulsputer/svelte-gym) test harness pages. Catches common setup mistakes at lint time so your component playgrounds work correctly.

## Installation

```bash
npm install --save-dev eslint-plugin-svelte-gym
```

> **Note:** This plugin requires `eslint >= 8.0.0` and [`svelte-eslint-parser`](https://github.com/sveltejs/svelte-eslint-parser) for Svelte file support.

## Usage

Add `svelte-gym` to the plugins section of your ESLint configuration and use the recommended preset:

```js
// .eslintrc.cjs
module.exports = {
  plugins: ['svelte-gym'],
  extends: ['plugin:svelte-gym/recommended']
};
```

Or configure individual rules manually:

```js
module.exports = {
  plugins: ['svelte-gym'],
  rules: {
    'svelte-gym/require-restore-props': 'warn',
    'svelte-gym/no-duplicate-prop-names': 'warn',
    'svelte-gym/require-props-state': 'error',
    'svelte-gym/single-component-in-test': 'error'
  }
};
```

## Rules

| Rule | Default | Description |
|------|---------|-------------|
| [`require-restore-props`](#require-restore-props) | ⚠️ warn | Require `restoreProps()` call when `TestHarness` is imported |
| [`no-duplicate-prop-names`](#no-duplicate-prop-names) | ⚠️ warn | Disallow duplicate `name` props across Gym components |
| [`require-props-state`](#require-props-state) | 🛑 error | Require the props object passed to `restoreProps()` to use `$state()` |
| [`single-component-in-test`](#single-component-in-test) | 🛑 error | Require `componentToTest` snippet to contain exactly one component |

### `require-restore-props`

**Default:** warn · **Category:** Best Practices

Warns when a Svelte file imports `TestHarness` from svelte-gym but does not call `restoreProps()` anywhere in the script block. Without `restoreProps()`, URL parameters will not be restored into component state.

```svelte
<!-- ❌ Bad -->
<script>
  import { TestHarness } from 'svelte-gym';
  let props = $state({ color: 'red' });
</script>

<!-- ✅ Good -->
<script>
  import { TestHarness, restoreProps } from 'svelte-gym';
  let props = $state({ color: 'red' });
  restoreProps(props);
</script>
```

### `no-duplicate-prop-names`

**Default:** warn · **Category:** Best Practices

Warns when multiple `Gym*` components use the same `name` prop value, which causes permalink parameter collisions.

```svelte
<!-- ❌ Bad — both controls write to the same URL parameter -->
<GymSlider name="size" ... />
<GymTextbox name="size" ... />

<!-- ✅ Good -->
<GymSlider name="width" ... />
<GymTextbox name="label" ... />
```

### `require-props-state`

**Default:** error · **Category:** Possible Errors

Errors when `restoreProps(props)` is called but `props` was not declared with `$state()`. Without `$state()`, URL-restored values will be set but won't trigger Svelte reactivity.

```svelte
<!-- ❌ Bad -->
<script>
  import { restoreProps } from 'svelte-gym';
  let props = { color: 'red' };
  restoreProps(props);
</script>

<!-- ✅ Good -->
<script>
  import { restoreProps } from 'svelte-gym';
  let props = $state({ color: 'red' });
  restoreProps(props);
</script>
```

### `single-component-in-test`

**Default:** error · **Category:** Possible Errors

Errors when the `componentToTest` snippet contains more than one child element, or when its child is a plain HTML element instead of a component. This enforces testing components in isolation — wrapping in `<div>` or `<section>` may make things look correct in the harness but behave differently in production.

```svelte
<!-- ❌ Bad — wrapper div hides real layout behavior -->
{#snippet componentToTest()}
  <div>
    <MyComponent {...props} />
  </div>
{/snippet}

<!-- ❌ Bad — multiple elements -->
{#snippet componentToTest()}
  <MyComponent {...props} />
  <AnotherComponent />
{/snippet}

<!-- ✅ Good -->
{#snippet componentToTest()}
  <MyComponent {...props} />
{/snippet}
```

## License

MIT
