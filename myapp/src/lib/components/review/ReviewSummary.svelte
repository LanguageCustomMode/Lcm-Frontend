<script lang="ts">
	import type { ReviewSummary } from '$lib/types';

	interface Props {
		summary: ReviewSummary;
	}

	let { summary }: Props = $props();
</script>

<div class="review-summary">
	<p>Reviewed: {summary.total_reviewed}</p>
	<p>XP Earned: {summary.xp_earned}</p>
	<p>Accuracy: {Math.round(summary.accuracy * 100)}%</p>
</div>
