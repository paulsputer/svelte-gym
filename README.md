
# svelte-gym

A gym to fully exercise your Svelte components.

![image](https://github.com/paulsputer/svelte-gym/assets/4686906/b06068e8-bdbd-4efa-9155-6ef15f5023c5)


## Why Svelte Gym?

Svelte Gym aims to improve developer experience on two specific challenges of component development and maintenance:

1. Testing the responsiveness of a component with respect to it's parent element
2. Sharing specific scenarios that may be problematic or that need to be tested


# Usage

```bash
npm install -D svelte-dev
pnpm install -D svelte-dev
bun install -D svelte-dev
```

Create a gym route for each component containing the following:


```svelte
<script>
    import { TestHarness, stringToBool, GymCheckbox, GymLog, GymTextbox } from "svelte-gym";

    let props = {
        //Define your component properties and callbacks
    }

</script>

<TestHarness>
	<svelte:fragment slot="componentToTest">
		<YourComponent {...props} />
	</svelte:fragment>

	<svelte:fragment slot="controls">
		<!-- Add GymControls to exercise custom properties of your component -->
	</svelte:fragment>
</TestHarness>
```


# Support

If you like this project please consider supporting it:

<a href="https://www.buymeacoffee.com/sveltegym" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>