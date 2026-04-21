<script lang="ts">
	import FlashcardReview from '$lib/components/review/FlashcardReview.svelte';
	import ReviewProgress from '$lib/components/review/ReviewProgress.svelte';
	import ReviewSummary from '$lib/components/review/ReviewSummary.svelte';
	import { onMount, type Snippet } from 'svelte';
	import type { Activity, ContentItem, ReviewSummary as ReviewSummaryType } from '$lib/types';

	const MAX_ROUNDS = 10;

	interface Props {
		activity: Activity;
		title?: string;
		renderItem?: Snippet<[ContentItem, (rating: 1 | 2 | 3 | 4) => void]>;
	}

	let { activity, title = 'Review', renderItem }: Props = $props();

	let items = $state<ContentItem[]>([]);
	let sessionId = $state<string | null>(null);
	let currentIndex = $state(0);
	let loading = $state(false);
	let summary = $state<ReviewSummaryType | null>(null);
	let error = $state<string | null>(null);
	let reviewStartedAt = $state<number | null>(null);
	let reviews = $state<{ content_item_id: string; rating: 1 | 2 | 3 | 4; time_ms: number }[]>([]);

	let roundNumber = $state(1);
	let totalReviewedAccum = $state(0);
	let correctAccum = $state(0);
	let xpAccum = $state(0);

	const startSession = async (includeNew: boolean = true) => {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/activities/${activity.id}/review-session`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ include_new: includeNew })
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			items = payload.items ?? [];
			sessionId = payload.session_id;
			currentIndex = 0;
			reviews = [];
			reviewStartedAt = performance.now();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start review';
		} finally {
			loading = false;
		}
	};

	const rateItem = async (rating: 1 | 2 | 3 | 4) => {
		if (!sessionId) return;
		const item = items[currentIndex];
		if (!item) return;
		const timeMs = reviewStartedAt ? Math.round(performance.now() - reviewStartedAt) : 0;
		reviewStartedAt = performance.now();
		reviews = [...reviews, { content_item_id: item.id, rating, time_ms: timeMs }];
		try {
			if (currentIndex === items.length - 1) {
				const res = await fetch(`/api/review-sessions/${sessionId}/complete`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ activity_id: activity.id, reviews })
				});
				if (!res.ok) throw new Error(await res.text());
				const roundSummary: ReviewSummaryType = await res.json();

				totalReviewedAccum += roundSummary.total_reviewed;
				xpAccum += roundSummary.xp_earned;
				correctAccum += reviews.filter((r) => r.rating >= 3).length;

				if ((roundSummary.remaining_due ?? 0) > 0 && roundNumber < MAX_ROUNDS) {
					roundNumber += 1;
					await startSession(false);
					if (items.length === 0) {
						showFinalSummary();
					}
				} else {
					showFinalSummary();
				}
			} else {
				currentIndex += 1;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to submit review';
		}
	};

	function showFinalSummary() {
		summary = {
			total_reviewed: totalReviewedAccum,
			xp_earned: xpAccum,
			accuracy: totalReviewedAccum > 0 ? correctAccum / totalReviewedAccum : 0
		};
	}

	onMount(() => startSession());
</script>

<h1>{title}</h1>
{#if error}
	<p class="error">{error}</p>
{/if}
{#if loading}
	<p>Loading review session...</p>
{:else if summary}
	<ReviewSummary {summary} />
{:else if items.length > 0}
	{#if roundNumber > 1}
		<p class="round-label">Round {roundNumber}</p>
	{/if}
	<ReviewProgress current={currentIndex + 1} total={items.length} />
	{#if renderItem}
		{@render renderItem(items[currentIndex], rateItem)}
	{:else}
		<FlashcardReview item={items[currentIndex]} onrate={rateItem} />
	{/if}
{:else}
	<p>No items to review.</p>
{/if}

<style>
	.error {
		color: #b42318;
	}
	.round-label {
		font-size: 0.875rem;
		color: #666;
		margin-bottom: 0.25rem;
	}
</style>
