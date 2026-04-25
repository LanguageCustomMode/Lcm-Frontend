<script lang="ts">
	import { page } from '$app/stores';
	import FlashcardReviewFlow from '$lib/components/flows/FlashcardReviewFlow.svelte';
	import FlashcardAudioFlow from '$lib/components/flows/FlashcardAudioFlow.svelte';
	import AudiocardReviewFlow from '$lib/components/flows/AudiocardReviewFlow.svelte';
	import McqReviewFlow from '$lib/components/flows/McqReviewFlow.svelte';
	import ConversationFlow from '$lib/components/flows/ConversationFlow.svelte';
	import WritingChatFlow from '$lib/components/flows/WritingChatFlow.svelte';
	import ReadingChatFlow from '$lib/components/flows/ReadingChatFlow.svelte';

	let { data } = $props();
	const { activity, flowType } = data;
</script>

<div class="flow-actions">
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
	.flow-actions {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 0.75rem;
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
