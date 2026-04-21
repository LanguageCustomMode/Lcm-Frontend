<script lang="ts">
	import FlashcardReviewFlow from './FlashcardReviewFlow.svelte';
	import type { Activity } from '$lib/types';

	let { activity }: { activity: Activity } = $props();
</script>

<div class="stub">
	<p class="note">MCQ flow — coming soon. Falling back to standard review.</p>
	<FlashcardReviewFlow {activity} />
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
