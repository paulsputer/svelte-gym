<p align="center">
 <img width="200" src="./static/svelte-gym.png" />
</p>

# Svelte Gym

<a href="https://www.buymeacoffee.com/sveltegym" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


**Rapidly create, exercise, and share Svelte component states via URL-encoded permalinks.**


## Why Svelte Gym?

Developing and testing components should be seamless. Svelte Gym provides a playground environment to exercise your components and ensure they respond correctly to various inputs and constraints.

**Key Features:**

*   **URL-Driven State:** Every control and property is reflected in the URL. Share a link, share a state.
*   **Visual Regression Ready:** Deterministic URLs make it easy to use tools like [BackstopJS](https://github.com/garris/BackstopJS) to detect visual regressions.
*   **LLM Friendly:** The URL structure provides a context-rich, text-based representation of your component's state, making it ideal for AI-assisted development and debugging.

### Use Cases

*   **Responsive Testing:** How does the component respond when the parent element resizes?
*   **Style Verification:** Is the font size on the parent element respected?
*   **Edge Cases:** Does text overflow expectedly? Is bad data (null, NaN, undefined) handled gracefully?
*   **Collaboration:** Share a specific component state with a colleague or an LLM to reproduce a bug.

## Getting Started

### Installation

```bash
npm install -D svelte-gym
# or
pnpm install -D svelte-gym
# or
bun install -D svelte-gym
```

### Basic Usage

Create a `+page.svelte` route for your component (e.g., `src/routes/gym/my-component/+page.svelte`):

```svelte
<script lang="ts">
    import { TestHarness, restoreProps, GymCheckbox, GymTextbox } from "svelte-gym";
    import MyComponent from '$lib/MyComponent.svelte';

    // 1. Define your component properties
    let props = $state({
        label: "Hello World",
        isActive: true,
        count: 0
    });

    // 2. Restore properties from URL parameters automatically
    // This allows the URL to drive the component state
    restoreProps(props);
</script>

<!-- 3. Wrap your component in the TestHarness -->
<TestHarness>
    {#snippet componentToTest()}
        <MyComponent {...props} />
    {/snippet}

    <!-- 4. Add controls to manipulate props -->
    {#snippet controls()}
        <ul>
             <li><GymCheckbox bind:props name="isActive" /></li>
             <li><GymTextbox bind:props name="label" /></li>
        </ul>
    {/snippet}
</TestHarness>
```

## AI / LLM Workflow & Best Practices

Svelte Gym is designed to be "interpreter-friendly." To ensure the best results and visual parity when using LLMs for component development:

### 1. Minimal `componentToTest` Snippet
The `componentToTest` snippet should **only** contain the component being tested. 
> [!IMPORTANT]
> **Avoid wrapping the component in extra `div` or `section` tags.** This ensures that the component's layout and styles are tested in isolation, matching how it will appear when deployed.

**Correct:**
```svelte
{#snippet componentToTest()}
    <MyComponent {...props} />
{/snippet}
```

**Incorrect:**
```svelte
{#snippet componentToTest()}
    <div class="wrapper"> <!-- ❌ DON'T DO THIS -->
        <MyComponent {...props} />
    </div>
```

### 2. Use `Gym*` Input Components
Always use the built-in `Gym` prefixed input components (e.g., `GymSlider`, `GymTextbox`, `GymCheckbox`) in the `controls` snippet.
> [!IMPORTANT]
> **Do not use standard HTML inputs or other custom components.** `Gym*` inputs are specifically designed to handle and test edge cases like `null`, `undefined`, `NaN`, and `Infinity`, which are critical for robust component testing and are not supported by standard inputs.

### 3. URL-Driven State & Reproductions
1.  **Describe the Issue:** "My component breaks when the label is too long."
2.  **Generate a Reproduction:** The LLM can generate a Svelte Gym URL with a long label string encoded in the parameters.
    *   *Example:* `http://localhost:5173/gym/button?label=Super+Long+Label+That+Breaks+Layout`
3.  **Fix and Verify:** You can verify the fix visually, and the URL serves as a regression test case.

## API Reference

### `TestHarness`

The main wrapper for your component playground.

**Props:**

*   `maxWidth` (number, optional): Maximum width constraint for the test area.
*   `maxHeight` (number, optional): Maximum height constraint for the test area.
*   `maxFontSize` (number, optional): Maximum font size for the test area.

**Snippets:**

*   `componentToTest`: Place the component you want to test here.
*   `controls`: Place `Gym*` controls here to modify `props`.

### `restoreProps(props)`

Synchronizes the URL search parameters with your local `props` object. This must be called in your component's `<script>` section.

### Controls (`Gym*` Components)

All controls support `bind:props` and a `name` attribute corresponding to the property key in `props`.

*   `GymCheckbox`: Boolean toggle.
*   `GymTextbox`: String input.
*   `GymSlider`: Numeric slider (requires `min`, `max`).
*   `GymDropdown`: Select from a list of options.
*   `GymRadioGroup`: Radio button group.
*   `GymLog`: Displays a log of events (passed as an array of strings).

### JSON Path Support

Svelte Gym supports nested properties using dot notation. This is useful for complex state objects.

```svelte
<script lang="ts">
let props = $state({
    config: {
        theme: {
            mode: 'dark'
        }
    }
});
</script>
```

In your controls:

```svelte
<GymDropdown bind:props name="config.theme.mode" options={['light', 'dark']} />
```

## License

MIT