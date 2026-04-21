<script lang="ts">
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
