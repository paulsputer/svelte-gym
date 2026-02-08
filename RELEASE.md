# Release Notes

## v1.0.1 - Svelte 5 Runes Migration (2026-02-08)

### Major Refactor: Svelte 5 Runes

This release migrates all `svelte-gym` components to use Svelte 5 Runes syntax, providing better reactivity, type safety, and compatibility with modern Svelte applications.

### Bug Fixes

- **Fixed infinite reactivity loop** that caused "Maximum update depth exceeded" errors in `TestHarness` and control components
- **Eliminated deprecation warning** for grid option (changed default from `true` to `'20-grid-light-mode'`)
- **Fixed reactivity issues** where control changes weren't propagating to components under test

### Breaking Changes

#### Component API Changes

All components now use Svelte 5 Runes syntax:

**Before (Svelte 4):**
```svelte
<script>
  export let props;
  export let name;
  export let label = name;
</script>
```

**After (Svelte 5 Runes):**
```svelte
<script>
  let {
    props = $bindable(),
    name,
    label = name
  } = $props();
</script>
```

#### TestHarness Slot Changes

`TestHarness` now uses **snippets** instead of named slots:

**Before:**
```svelte
<TestHarness>
  <svelte:fragment slot="componentToTest">
    <MyComponent {...props} />
  </svelte:fragment>
  
  <svelte:fragment slot="controls">
    <GymCheckbox bind:props name="active" />
  </svelte:fragment>
</TestHarness>
```

**After:**
```svelte
<TestHarness>
  {#snippet componentToTest()}
    <MyComponent {...props} />
  {/snippet}
  
  {#snippet controls()}
    <GymCheckbox bind:props name="active" />
  {/snippet}
</TestHarness>
```

#### Consumer Code Changes

Props objects in consumer pages must use `$state()`:

**Before:**
```svelte
<script>
  let props = {
    label: 'default text',
    active: true
  };
</script>
```

**After:**
```svelte
<script>
  let props = $state({
    label: 'default text',
    active: true
  });
</script>
```

### Components Refactored

All components have been updated to Svelte 5 Runes:

- `TestHarness` - Now uses snippets and `$state`
- `GymCheckbox` - Uses `$props()`, `$bindable()`, `$state()`, `$effect()`
- `GymDropdown` - Uses `$props()`, `$bindable()`, `$state()`, `$effect()`, `$derived()`
- `GymSlider` - Uses `$props()`, `$bindable()`, `$state()`, `$effect()`
- `GymTextbox` - Uses `$props()`, `$bindable()`, `$state()`, `$effect()`
- `GymRadioGroup` - Uses `$props()`, `$bindable()`
- `GymButton` - Uses `$props()`, `$derived()`
- `GymLog` - Uses `$props()`

### Migration Guide

To upgrade your existing code:

1. **Update your props objects** to use `$state()`:
   ```svelte
   let props = $state({ /* your props */ });
   ```

2. **Replace slot syntax** with snippets in `TestHarness`:
   ```svelte
   {#snippet componentToTest()}
     <!-- your component -->
   {/snippet}
   ```

3. **Ensure Svelte 5** is installed:
   ```bash
   npm install svelte@^5.0.0
   ```

## v1.0.0 - Initial Release

Initial release of svelte-gym with Svelte 4 support.

---

## Svelte 5 & SvelteKit 2 Upgrade

**Major Upgrade**:
- Upgraded to Svelte 5 and SvelteKit 2.
- Updated `vite-plugin-svelte` to v4 (compatible with Svelte 5 / Vite 5).
- Resolved migration issues (e.g., self-closing tags).

# Release v0.4.0
Improvements to documentation, along with a kitchen sink example page.

+ `GymTextbox` learnt `multiline` - this allows testing components that expect textarea input

# Release v0.3.0

This version deprecates all previous grid settings in favour of a more structured naming convention.  
Previous names will continue to work but emit a console warning about the deprecated name usage.

 + 0-grid-light-mode
 + 10-grid-light-mode
 + 20-grid-light-mode
 + 50-grid-light-mode
 + 100-grid-light-mode
 + 0-grid-dark-mode
 + 10-grid-dark-mode
 + 20-grid-dark-mode
 + 50-grid-dark-mode
 + 100-grid-dark-mode
 + 10-text-light-mode
 + 20-text-light-mode
 + 50-text-light-mode
 + 100-text-light-mode
 + 10-text-dark-mode
 + 20-text-dark-mode
 + 50-text-dark-mode
 + 100-text-dark-mode

# Release v0.2.1

HOTFIX: remove stay import breaking build once imported

# Release v0.2.0

## Major Features and Improvements

### TestHarness

Now supports the following different grid backgrounds:

+ none
+ light
+ dark
+ black
+ white
+ textBlack
+ textWhite

These help test various scenarios especially when testing opacity and blurs on components.

To avoid any breaking changes usage of true / false continues to work.

### GymDropdown
+ learnt to accept objects and arrays of objects
    + array of objects default to `label` and `value` to override use `optLabel` and `optValue` attributes
+ learnt to use jsonpath for props

### GymSlider
+ learnt to accept a functor `fn` to apply to values
    + A common usage is to get decimal percentage i.e.  `(v) => v / 100`
+ learnt to default to useful min/max based on units if no min/max provided

## Bug Fixes and Other Changes

+ GymSlider units attribute defaults to null to get number rather than string value
+ Controls side bar now scrolls content to avoid page scrolling