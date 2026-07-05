import { SvelteComponentTyped } from 'svelte';
declare const __propDef: {
	props: {
		onclick: () => void;
		label?: string | undefined;
		active?: boolean | undefined;
		spinner?: boolean | undefined;
	};
	events: {
		[evt: string]: CustomEvent<unknown>;
	};
	slots: {
		icon: Record<string, never>;
	};
};
export type ExampleButtonProps = typeof __propDef.props;
export type ExampleButtonEvents = typeof __propDef.events;
export type ExampleButtonSlots = typeof __propDef.slots;
export default class ExampleButton extends SvelteComponentTyped<
	ExampleButtonProps,
	ExampleButtonEvents,
	ExampleButtonSlots
> {}
export {};
