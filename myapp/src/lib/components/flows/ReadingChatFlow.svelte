<script lang="ts">
	import ConversationFlow from './ConversationFlow.svelte';
	import type { Activity } from '$lib/types';

	let { activity }: { activity: Activity } = $props();
</script>

<div class="stub">
	<p class="note">Reading flow (side-by-side passage + chat) — coming soon. Falling back to conversation.</p>
	<ConversationFlow {activity} />
</div>

<style>
	.note {
		background: #fffbea;
		border: 1px solid #facc15;
		border-radius: var(--radius);
		padding: 0.5rem 0.75rem;
		font-size: 0.8rem;
		color: #7c5500;
		margin-bottom: 0.75rem;
	}
</style>
