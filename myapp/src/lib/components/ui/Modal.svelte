<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title?: string;
		children: Snippet;
		onclose?: () => void;
	}

	let { open = $bindable(), title, children, onclose }: Props = $props();
</script>

{#if open}
	<div class="modal-overlay" role="presentation" onclick={() => { open = false; onclose?.(); }}>
		<div class="modal" role="dialog" onclick={(e) => e.stopPropagation()}>
			{#if title}
				<h2>{title}</h2>
			{/if}
			{@render children()}
		</div>
	</div>
{/if}
