<script lang="ts">
	import FlashcardReview from '$lib/components/review/FlashcardReview.svelte';
	import ReviewProgress from '$lib/components/review/ReviewProgress.svelte';
	import ReviewSummary from '$lib/components/review/ReviewSummary.svelte';
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import type { Activity, ContentItem, ReviewSummary as ReviewSummaryType } from '$lib/types';

	const PAGE_SIZE = 20;
	const PREFETCH_THRESHOLD = 3;
	// Minimum gap (cards) before a requeued card can reappear, to avoid
	// instant repetition when the queue is short.
	const REQUEUE_MIN_GAP = 2;

	interface Props {
		activity: Activity;
		title?: string;
		renderItem?: Snippet<[ContentItem, (rating: 1 | 2 | 3 | 4) => void]>;
	}

	let { activity, title = 'Review', renderItem }: Props = $props();

	// Continuous queue of cards to show. We shift from the front and splice
	// requeued / prefetched cards into it without any visible "round" boundary.
	let queue = $state<ContentItem[]>([]);
	let sessionId = $state<string | null>(null);
	let loading = $state(false);
	let summary = $state<ReviewSummaryType | null>(null);
	let error = $state<string | null>(null);
	let reviewStartedAt = $state<number | null>(null);

	// Accumulators for the final summary + /complete call.
	let reviewLog = $state<
		{ content_item_id: string; rating: 1 | 2 | 3 | 4; time_ms: number }[]
	>([]);
	let totalReviewed = $state(0);
	let correctCount = $state(0);
	let xpAccum = $state(0);
	// Unique cards seen this session — used to avoid prefetching dupes and
	// as the denominator for the progress bar.
	let seenIds = $state<Set<string>>(new Set());

	let prefetching = false;
	let exhausted = $state(false);
	let finalized = false;

	const shuffle = <T,>(arr: T[]): T[] => {
		const a = arr.slice();
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	};

	const requeueInsertIndex = (queueLen: number): number => {
		// Put the card somewhere between REQUEUE_MIN_GAP and the end, biased
		// toward the middle. queueLen here is the length AFTER we've already
		// shifted the current card off.
		if (queueLen <= REQUEUE_MIN_GAP) return queueLen;
		const min = REQUEUE_MIN_GAP;
		const max = queueLen;
		return min + Math.floor(Math.random() * (max - min + 1));
	};

	const fetchMore = async (includeNew: boolean): Promise<ContentItem[]> => {
		const res = await fetch(`/api/activities/${activity.id}/review-session`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				include_new: includeNew,
				limit: PAGE_SIZE,
				exclude_ids: [...seenIds]
			})
		});
		if (!res.ok) throw new Error(await res.text());
		const payload = await res.json();
		if (!sessionId) sessionId = payload.session_id;
		const items: ContentItem[] = payload.items ?? [];
		for (const it of items) seenIds.add(it.id);
		seenIds = seenIds; // trigger reactivity
		return shuffle(items);
	};

	const prefetchIfLow = async () => {
		if (prefetching || exhausted) return;
		if (queue.length >= PREFETCH_THRESHOLD) return;
		prefetching = true;
		try {
			const more = await fetchMore(true);
			if (more.length === 0) {
				exhausted = true;
			} else {
				queue = [...queue, ...more];
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load more cards';
		} finally {
			prefetching = false;
		}
	};

	const startSession = async () => {
		loading = true;
		error = null;
		try {
			const first = await fetchMore(true);
			queue = first;
			exhausted = first.length === 0;
			reviewStartedAt = performance.now();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start review';
		} finally {
			loading = false;
		}
	};

	const finalize = async () => {
		if (finalized) return;
		finalized = true;
		if (!sessionId || reviewLog.length === 0) {
			summary = {
				total_reviewed: totalReviewed,
				xp_earned: xpAccum,
				accuracy: totalReviewed > 0 ? correctCount / totalReviewed : 0
			};
			return;
		}
		try {
			const res = await fetch(`/api/review-sessions/${sessionId}/complete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ activity_id: activity.id, reviews: reviewLog })
			});
			if (!res.ok) throw new Error(await res.text());
			summary = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to finalize session';
			summary = {
				total_reviewed: totalReviewed,
				xp_earned: xpAccum,
				accuracy: totalReviewed > 0 ? correctCount / totalReviewed : 0
			};
		}
	};

	const rateItem = async (rating: 1 | 2 | 3 | 4) => {
		const current = queue[0];
		if (!current) return;
		const timeMs = reviewStartedAt ? Math.round(performance.now() - reviewStartedAt) : 0;
		reviewStartedAt = performance.now();

		// Optimistically pop the card; we'll reinsert it if the server says requeue.
		queue = queue.slice(1);

		let requeue = false;
		try {
			const res = await fetch(`/api/content/${current.id}/review`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rating })
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			requeue = !!payload.requeue;
			xpAccum += payload.xp_earned ?? 0;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to submit review';
			// On network failure, put the card back at the front so the user
			// can retry; do not count it as reviewed.
			queue = [current, ...queue];
			return;
		}

		totalReviewed += 1;
		if (rating >= 3) correctCount += 1;
		reviewLog = [...reviewLog, { content_item_id: current.id, rating, time_ms: timeMs }];

		if (requeue) {
			const idx = requeueInsertIndex(queue.length);
			queue = [...queue.slice(0, idx), current, ...queue.slice(idx)];
		}

		// Fire-and-forget prefetch; no await so the next card shows instantly.
		prefetchIfLow();

		if (queue.length === 0 && exhausted) {
			await finalize();
		}
	};

	onMount(() => startSession());

	// If user navigates away mid-session, finalize so stats land server-side.
	onDestroy(() => {
		if (!summary) finalize();
	});
</script>

{#if error}
	<p class="error">{error}</p>
{/if}
{#if loading}
	<p>Loading review session...</p>
{:else if summary}
	<ReviewSummary {summary} />
{:else if queue.length > 0}
	<ReviewProgress current={totalReviewed + 1} total={totalReviewed + queue.length} />
	{#if renderItem}
		{@render renderItem(queue[0], rateItem)}
	{:else}
		<FlashcardReview item={queue[0]} onrate={rateItem} />
	{/if}
{:else}
	<p>No items to review.</p>
{/if}

<style>
	.error {
		color: #b42318;
	}
</style>
