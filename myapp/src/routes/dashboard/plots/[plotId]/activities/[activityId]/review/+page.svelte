<script lang="ts">
	import FlashcardReview from '$lib/components/review/FlashcardReview.svelte';
	import ReviewProgress from '$lib/components/review/ReviewProgress.svelte';

	let { data } = $props();
</script>

<!-- TODO: Load review session from API, implement review flow -->
<!--
Stub outline:
- POST /activities/{activity_id}/review-session -> { session_id, cards }.
- Maintain index, current card, and local reviews[].
- On rate: append { card_id, rating, time_ms }.
- When done: POST /review-sessions/{session_id}/complete -> summary.
- Show ReviewSummary after completion.
-->
<h1>Review</h1>
<ReviewProgress current={0} total={0} />
