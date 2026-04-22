<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';
	import CorrectionsPanel from '$lib/components/chat/CorrectionsPanel.svelte';
	import SessionSummaryCard from '$lib/components/chat/SessionSummaryCard.svelte';
	import { useChatSession } from '$lib/composables/useChatSession.svelte';
	import { onMount } from 'svelte';
	import type { Activity } from '$lib/types';

	let { activity }: { activity: Activity } = $props();

	const chat = useChatSession({ activityId: activity.id });

	onMount(() => { chat.startSession(); });
</script>

<h1>Practice</h1>
{#if chat.error}
	<p class="error">{chat.error}</p>
{/if}

{#if chat.sessionSummary}
	<SessionSummaryCard summary={chat.sessionSummary} onrestart={chat.restart} />
{:else}
	<div class="practice-layout">
		<ChatWindow messages={chat.messages} loading={chat.loading} onsend={chat.sendMessage} />
		<CorrectionsPanel
			corrections={chat.corrections}
			sessionXp={chat.sessionXp}
			xpPulse={chat.xpPulse}
			onend={chat.endSession}
		/>
	</div>
{/if}

<style>
	.practice-layout {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1rem;
		align-items: start;
	}

	.error {
		color: #b42318;
		margin-bottom: 0.5rem;
	}

	@media (max-width: 900px) {
		.practice-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
