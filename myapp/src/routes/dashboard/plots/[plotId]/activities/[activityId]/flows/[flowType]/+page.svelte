<script lang="ts">
	import { page } from '$app/stores';
	import FlashcardReviewFlow from '$lib/components/flows/FlashcardReviewFlow.svelte';
	import FlashcardAudioFlow from '$lib/components/flows/FlashcardAudioFlow.svelte';
	import AudiocardReviewFlow from '$lib/components/flows/AudiocardReviewFlow.svelte';
	import McqReviewFlow from '$lib/components/flows/McqReviewFlow.svelte';
	import ConversationFlow from '$lib/components/flows/ConversationFlow.svelte';
	import WritingChatFlow from '$lib/components/flows/WritingChatFlow.svelte';
	import ReadingChatFlow from '$lib/components/flows/ReadingChatFlow.svelte';
	import type { FlowType } from '$lib/types';

	const FLOW_LABELS: Record<FlowType, string> = {
		flashcard_review: 'Review',
		flashcard_audio: 'Pronunciation',
		audiocard_review: 'Listening',
		mcq_review: 'MCQ',
		conversation: 'Practice',
		writing_chat: 'Writing',
		reading_chat: 'Reading',
		tutor_chat: 'Tutor'
	};

	let { data } = $props();
	const { activity, flowType } = data;
</script>

<div class="plot-header">
	<div>
		<h1>{activity.name}</h1>
		<p class="plot-desc">{FLOW_LABELS[flowType] ?? flowType}</p>
	</div>
	<a class="exit-review" href="/dashboard/plots/{$page.params.plotId}/activities/{$page.params.activityId}">Exit</a>
</div>

{#if flowType === 'flashcard_review'}
	<FlashcardReviewFlow {activity} />
{:else if flowType === 'flashcard_audio'}
	<FlashcardAudioFlow {activity} />
{:else if flowType === 'audiocard_review'}
	<AudiocardReviewFlow {activity} />
{:else if flowType === 'mcq_review'}
	<McqReviewFlow {activity} />
{:else if flowType === 'conversation' || flowType === 'tutor_chat'}
	<ConversationFlow {activity} />
{:else if flowType === 'writing_chat'}
	<WritingChatFlow {activity} />
{:else if flowType === 'reading_chat'}
	<ReadingChatFlow {activity} />
{:else}
	<p>Unsupported flow: {flowType}</p>
{/if}

<style>
	.plot-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.plot-header h1 {
		font-family: 'Nunito', 'Trebuchet MS', 'Segoe UI', sans-serif;
		font-weight: 700;
	}
	.plot-desc {
		font-size: 0.8rem;
		color: #666;
		margin-top: 0.25rem;
	}

	.exit-review {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		font-size: 0.8rem;
		font-weight: 600;
		color: #fff;
		background: #3f8a52;
		border: 1px solid #2f6a3f;
		border-radius: 999px;
		padding: 0.3rem 0.7rem;
		transition: background 0.15s ease, border-color 0.15s ease;
	}

	.exit-review:hover {
		background: #347444;
		border-color: #275a35;
	}
</style>
