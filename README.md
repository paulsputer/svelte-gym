
# svelte-gym

Rapidly create and exercise your Svelte components.

![image](https://github.com/paulsputer/svelte-gym/assets/4686906/b06068e8-bdbd-4efa-9155-6ef15f5023c5)


## Why Svelte Gym?

Developing and testing components should be easy!  Svelte Gym provides a playground environment to exercise your components and ensure they are responding correctly.
+ How does the component respond when the parent element gets larger/smaller both vertically / horizontally?
+ Is font size on the parent element respected?
+ Does text overflow in the expected way?
+ Is bad data handled gracefully or leak to the UI i.e null, NaN, Inf, undefined

### Testing

Svelte Gym makes it easy to replicate component state by creating permalinks for a component's state.

For example:

+ http://localhost:5174/?__width=262px&__height=221px&spinner=false&label=Test+Text#
+ http://localhost:5174/?__width=262px&__height=221px&spinner=true&label=Test+Text#

This not only makes sharing problematic scenarios with your team straight forward but it also unlocks the possibility for 
visual regression testing using a tool such as [BackstopJS](https://github.com/garris/BackstopJS)


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

## JSON Path Support

To allow testing of components with more complex structures a basic form of JSON Path is supported.  i.e. `root.subA.subB`, this also works with arrays `root.myArray.0`


# Support

If you like this project please consider supporting it:

<a href="https://www.buymeacoffee.com/sveltegym" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>