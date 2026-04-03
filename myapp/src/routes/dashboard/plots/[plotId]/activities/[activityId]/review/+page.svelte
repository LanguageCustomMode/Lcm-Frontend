<script lang="ts">
	import FlashcardReview from '$lib/components/review/FlashcardReview.svelte';
	import ReviewProgress from '$lib/components/review/ReviewProgress.svelte';

	let { data } = $props();
</script>

<!-- TODO: Load review session from API, implement review flow -->
<h1>Review</h1>
<ReviewProgress current={0} total={0} />
