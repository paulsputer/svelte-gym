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
<script>
    import { TestHarness, restoreProps, GymCheckbox, GymTextbox } from "svelte-gym";
    import MyComponent from '$lib/MyComponent.svelte';

    // 1. Define your component properties
    let props = {
        label: "Hello World",
        isActive: true,
        count: 0
    };

    // 2. Restore properties from URL parameters automatically
    // This allows the URL to drive the component state
    restoreProps(props);
</script>

<!-- 3. Wrap your component in the TestHarness -->
<TestHarness>
    <svelte:fragment slot="componentToTest">
        <MyComponent {...props} />
    </svelte:fragment>

    <!-- 4. Add controls to manipulate props -->
    <svelte:fragment slot="controls">
        <ul>
             <li><GymCheckbox bind:props name="isActive" /></li>
             <li><GymTextbox bind:props name="label" /></li>
        </ul>
    </svelte:fragment>
</TestHarness>
```

## API Reference

### `TestHarness`

The main wrapper for your component playground.

**Props:**

*   `maxWidth` (number, optional): Maximum width constraint for the test area.
*   `maxHeight` (number, optional): Maximum height constraint for the test area.
*   `maxFontSize` (number, optional): Maximum font size for the test area.

**Slots:**

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

```javascript
let props = {
    config: {
        theme: {
            mode: 'dark'
        }
    }
};
```

In your controls:

```svelte
<GymDropdown bind:props name="config.theme.mode" options={['light', 'dark']} />
```

## AI / LLM Workflow

Svelte Gym is designed to be "interpreter-friendly." When working with an LLM:

1.  **Describe the Issue:** "My component breaks when the label is too long."
2.  **Generate a Reproduction:** The LLM can generate a Svelte Gym URL with a long label string encoded in the parameters.
    *   *Example:* `http://localhost:5173/gym/button?label=Super+Long+Label+That+Breaks+Layout`
3.  **Fix and Verify:** You can verify the fix visually, and the URL serves as a regression test case.

## License

MIT