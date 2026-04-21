<script lang="ts">
	import FlashcardReviewFlow from './FlashcardReviewFlow.svelte';
	import ListeningReview from '$lib/components/review/ListeningReview.svelte';
	import type { Activity, ContentItem } from '$lib/types';

	let { activity }: { activity: Activity } = $props();
</script>

{#snippet renderItem(item: ContentItem, rate: (rating: 1 | 2 | 3 | 4) => void)}
	<ListeningReview {item} onrate={rate} />
{/snippet}

<FlashcardReviewFlow {activity} title="Listening" {renderItem} />
