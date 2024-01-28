
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

Problematic scenarios can now be easily replicated and shared with team members.  It also makes visual regression testing using a tool such as [BackstopJS](https://github.com/garris/BackstopJS) a breeze.

#### URL Param and Props Structure

For more complex components it may be necessary to create generators, rather than control the specific content you most likely want to control the number of elements.  In those cases best prefix properties with a single underscore to help make intentions clear.  Be aware that Svelte-Gym reserves a double underscore prefix.

# Usage

```bash
npm install -D svelte-dev
pnpm install -D svelte-dev
bun install -D svelte-dev
```

Create a gym route for each component containing the following:


```svelte
<script>
    import { TestHarness, restoreProps, GymCheckbox, GymLog, GymTextbox } from "svelte-gym";

    let props = {
        //Define your component properties and callbacks
    }

	// properties are automatically restored from the URL Params
	restoreProps(props);

</script>

<TestHarness>
	<svelte:fragment slot="componentToTest">
		<YourComponent {...props} />
	</svelte:fragment>

	<svelte:fragment slot="controls">
		<!-- Add GymControls to exercise custom properties of your component -->
		<!-- Use the hideExtra param to hide options such as null, undefined etc. -->
	</svelte:fragment>
</TestHarness>
```

## JSON Path Support

To allow testing of components with more complex structures a basic form of JSON Path is supported.  i.e. `root.subA.subB`, this also works with arrays `root.myArray.0`


# Support The Project!

If Svelte-Gym saves you time please consider supporting it:

<a href="https://www.buymeacoffee.com/sveltegym" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

# Enterprise Support

We offer support to startups and enterprise, [subscribe here](https://www.buymeacoffee.com/sveltegym/membership)


# Training / Workshops

[Tap Here](https://www.buymeacoffee.com/sveltegym/commissions) to book training for your team either online or in-person.


## License

[MIT](https://github.com/sveltejs/kit/blob/main/LICENSE)