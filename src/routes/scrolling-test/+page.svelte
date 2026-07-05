<script>
	import TestHarness from '$lib/TestHarness.svelte';
	import ScrollingDemo from './ScrollingDemo.svelte';
</script>

<TestHarness>
	{#snippet componentToTest()}
		<ScrollingDemo />
	{/snippet}
</TestHarness>
