# Contributing to Svelte Gym

We welcome contributions! Whether it's reporting a bug, suggesting a feature, or writing code, your help is appreciated.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/svelte-gym.git
    cd svelte-gym
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    # or
    pnpm install
    ```

## Development Workflow

1.  **Create a branch** for your feature or fix:
    ```bash
    git checkout -b feature/my-new-feature
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
3.  **Make your changes**.
4.  **Verify your changes** manually in the browser.

## Adding New Gym Controls

If you are adding a new type of control (e.g., `GymColorPicker`), please follow these patterns:

1.  **Bind to `props`**: The control should accept `bind:props` and a `name` prop.
2.  **Use `setProp` / `getProp`**: Use the helper functions from `$lib/helpers.js` to handle nested properties safely.
3.  **Handle URL Sync**: Ensure that changes to the value update the `props` object, which `restoreProps` (in the parent) will then reflect in the URL (if wired up correctly, usually handled by reactivity in the user's page, but the control itself should primarily mutate `props`).
4.  **UI Consistency**: Reuse existing styles or CSS variables where possible to maintain the "gym" aesthetic.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
