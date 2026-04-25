<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';
	import CorrectionsPanel from '$lib/components/chat/CorrectionsPanel.svelte';
	import SessionSummaryCard from '$lib/components/chat/SessionSummaryCard.svelte';
	import { useChatSession } from '$lib/composables/useChatSession.svelte';
	import { renderMarkdown } from '$lib/utils/markdown';
	import { onMount } from 'svelte';
	import type { Activity } from '$lib/types';

	interface ContentItem {
		id: string;
		content_type: string;
		content: { text?: string; [key: string]: unknown };
	}

	let { activity }: { activity: Activity } = $props();

	const chat = useChatSession({ activityId: activity.id });

	let passage = $state<string>('');
	let passageLoading = $state(true);

	const loadPassage = async () => {
		passageLoading = true;
		try {
			const res = await fetch(`/api/activities/${activity.id}/content?content_type=note`);
			if (!res.ok) throw new Error(await res.text());
			const items: ContentItem[] = await res.json();
			passage = items
				.map((it) => (typeof it.content === 'object' ? it.content?.text ?? '' : String(it.content ?? '')))
				.filter(Boolean)
				.join('\n\n');
		} catch (err) {
			chat.error = err instanceof Error ? err.message : 'Failed to load passage';
		} finally {
			passageLoading = false;
		}
	};

	onMount(() => {
		loadPassage();
		chat.startSession();
	});
</script>

{#if chat.error}
	<p class="error">{chat.error}</p>
{/if}

{#if chat.sessionSummary}
	<SessionSummaryCard summary={chat.sessionSummary} onrestart={chat.restart} />
{:else}
	<div class="reading-layout">
		<aside class="passage-panel">
			<h2>{activity.name}</h2>
			{#if passageLoading}
				<p class="empty-note">Loading passage...</p>
			{:else if passage}
				<div class="passage-body">
					{@html renderMarkdown(passage)}
				</div>
			{:else}
				<p class="empty-note">No passage attached to this activity yet.</p>
			{/if}
		</aside>

		<div class="chat-col">
			<ChatWindow messages={chat.messages} loading={chat.loading} onsend={chat.sendMessage} />
		</div>

		<CorrectionsPanel
			corrections={chat.corrections}
			sessionXp={chat.sessionXp}
			xpPulse={chat.xpPulse}
			onend={chat.endSession}
		/>
	</div>
{/if}

<style>
	.reading-layout {
		display: grid;
		grid-template-columns: 1.1fr 1.4fr 0.9fr;
		gap: 1rem;
		align-items: start;
	}

	.passage-panel {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem 1.1rem;
		max-height: 70vh;
		overflow-y: auto;
	}

	.passage-panel h2 {
		font-size: 1rem;
		margin: 0 0 0.6rem;
		color: #333;
	}

	.passage-body {
		font-size: 0.9rem;
		line-height: 1.55;
		color: #222;
	}

	.passage-body :global(p) {
		margin: 0 0 0.7rem;
	}

	.passage-body :global(h1),
	.passage-body :global(h2),
	.passage-body :global(h3) {
		font-size: 0.95rem;
		margin: 0.8rem 0 0.4rem;
	}

	.chat-col {
		min-width: 0;
	}

	.empty-note {
		font-size: 0.8rem;
		color: #999;
	}

	.error {
		color: #b42318;
		margin-bottom: 0.5rem;
	}

	@media (max-width: 1100px) {
		.reading-layout {
			grid-template-columns: 1fr;
		}

		.passage-panel {
			max-height: 40vh;
		}
	}
</style>
