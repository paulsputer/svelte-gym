<script lang="ts">
	interface GymOverrideButtonsProps {
		options: Array<{ label: string; value: any }>;
		activeValue: any;
		optDefault: string;
		onselect: (value: any) => void;
		onclear: () => void;
	}

	let { options, activeValue, optDefault, onselect, onclear }: GymOverrideButtonsProps = $props();
</script>

<div class="override-group">
	{#each options as opt, i}
		<button
			type="button"
			class="override-btn"
			class:active={activeValue !== optDefault && activeValue === opt.value}
			class:first={i === 0}
			class:last={i === options.length - 1}
			title="Set to {opt.label}"
			onclick={() => {
				if (activeValue === opt.value) {
					onclear();
				} else {
					onselect(opt.value);
				}
			}}
		>
			{#if opt.label === 'undefined'}
				undef
			{:else}
				{opt.label}
			{/if}
		</button>
	{/each}
</div>

<style>
	.override-group {
		display: flex;
		flex-direction: row;
		flex-shrink: 0;
		align-items: center;
	}

	.override-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2px 8px;
		border: 1px solid rgba(0, 0, 0, 0.18);
		border-right-width: 0;
		border-radius: 0;
		background: rgba(255, 255, 255, 0.45);
		color: #999;
		cursor: pointer;
		transition: all 0.15s ease;
		line-height: 1;
		font-size: 15px;
		font-weight: 600;
		font-family: monospace;
		font-variant: small-caps;
		text-transform: lowercase;
		white-space: nowrap;
	}

	.override-btn.first {
		border-radius: 3px 0 0 3px;
	}

	.override-btn.last {
		border-radius: 0 3px 3px 0;
		border-right-width: 1px;
	}

	.override-btn:hover {
		color: #333;
		background: rgba(255, 255, 255, 0.85);
	}

	.override-btn.active {
		color: #fff;
		background: #e65100;
		border-color: #bf360c;
	}

	.override-btn.active + .override-btn {
		border-left-color: #bf360c;
	}

	.override-btn.active:hover {
		background: #bf360c;
		color: #fff;
	}
</style>
