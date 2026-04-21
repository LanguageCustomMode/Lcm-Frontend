<script lang="ts">
	import FlashcardReviewFlow from './FlashcardReviewFlow.svelte';
	import PronunciationReview from '$lib/components/review/PronunciationReview.svelte';
	import type { Activity, ContentItem } from '$lib/types';

	let { activity }: { activity: Activity } = $props();
</script>

{#snippet renderItem(item: ContentItem, rate: (rating: 1 | 2 | 3 | 4) => void)}
	<PronunciationReview {item} onrate={rate} />
{/snippet}

<FlashcardReviewFlow {activity} title="Pronunciation" {renderItem} />
