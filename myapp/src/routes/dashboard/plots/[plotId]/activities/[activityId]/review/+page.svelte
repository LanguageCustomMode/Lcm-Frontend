<script lang="ts">
	import FlashcardReview from '$lib/components/review/FlashcardReview.svelte';
	import ReviewProgress from '$lib/components/review/ReviewProgress.svelte';
	import ReviewSummary from '$lib/components/review/ReviewSummary.svelte';
	import { onMount } from 'svelte';
	import type { Card, ReviewSummary as ReviewSummaryType } from '$lib/types';
	import { page } from '$app/stores';

	let { data } = $props();

	let cards = $state<Card[]>([]);
	let sessionId = $state<string | null>(null);
	let currentIndex = $state(0);
	let loading = $state(false);
	let summary = $state<ReviewSummaryType | null>(null);
	let error = $state<string | null>(null);
	let reviewStartedAt = $state<number | null>(null);
	let reviews = $state<{ card_id: string; rating: 1 | 2 | 3 | 4; time_ms: number }[]>([]);

	const startSession = async () => {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/activities/${$page.params.activityId}/review-session`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			cards = payload.cards ?? [];
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

	const rateCard = async (rating: 1 | 2 | 3 | 4) => {
		if (!sessionId) return;
		const card = cards[currentIndex];
		if (!card) return;
		const timeMs = reviewStartedAt ? Math.round(performance.now() - reviewStartedAt) : 0;
		reviewStartedAt = performance.now();
		cards[currentIndex] = card;
		reviews = [...reviews, { card_id: card.id, rating, time_ms: timeMs }];
		try {
			if (currentIndex === cards.length - 1) {
				const res = await fetch(`/api/review-sessions/${sessionId}/complete`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ reviews })
				});
				if (!res.ok) throw new Error(await res.text());
				summary = await res.json();
			} else {
				currentIndex += 1;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to submit review';
		}
	};

	onMount(startSession);
</script>

<h1>Review</h1>
{#if error}
	<p class="error">{error}</p>
{/if}
{#if loading}
	<p>Loading review session...</p>
{:else if summary}
	<ReviewSummary {summary} />
{:else if cards.length > 0}
	<ReviewProgress current={currentIndex + 1} total={cards.length} />
	<FlashcardReview card={cards[currentIndex]} onrate={rateCard} />
{:else}
	<p>No cards to review.</p>
{/if}

<style>
	.error {
		color: #b42318;
	}
</style>
