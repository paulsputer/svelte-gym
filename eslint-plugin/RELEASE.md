# Release Notes — eslint-plugin-svelte-gym

## v1.0.1 — Documentation & Package Metadata (2026-03-23)

### Improvements

- **Comprehensive README**: Added full documentation covering installation, usage (recommended preset & manual configuration), and detailed rule descriptions with code examples.
- **Package Metadata**: Added keywords for improved npm discoverability (`eslint`, `svelte`, `svelte5`, `linter`, `visual testing`, `dev tools`, etc.) and included `README.md` in published files.

---

## v1.0.0 — Initial Release (2026-03-22)

First release of `eslint-plugin-svelte-gym` — a companion ESLint plugin for validating [svelte-gym](https://github.com/paulsputer/svelte-gym) test harness pages. Catches common setup mistakes at lint time.

### Rules

| Rule | Default | Description |
|------|---------|-------------|
| `require-restore-props` | ⚠️ warn | Require a `restoreProps()` call when `TestHarness` is imported |
| `no-duplicate-prop-names` | ⚠️ warn | Disallow duplicate `name` props across Gym components |
| `require-props-state` | 🛑 error | Require the props object passed to `restoreProps()` to use `$state()` |
| `single-component-in-test` | 🛑 error | Require `componentToTest` snippet to contain exactly one component |

### Features

- **Recommended Config**: Ship a `plugin:svelte-gym/recommended` preset that enables all four rules with sensible defaults.
- **Full Test Coverage**: Every rule includes unit tests with valid and invalid scenarios.
- **Peer Dependency**: Requires `eslint >= 8.0.0`; works with [`svelte-eslint-parser`](https://github.com/sveltejs/svelte-eslint-parser) for Svelte file support.
