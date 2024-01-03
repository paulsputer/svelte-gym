
# svelte-gym

A gym to fully exercise your Svelte components.


## Why Svelte Gym?

Svelte Gym aims to improve developer experience on two specific challenges of component development and maintenance:

1. Testing the responsiveness of a component with respect to it's parent element
2. Sharing specific scenarios that may be problematic or that need to be tested


# Usage

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


