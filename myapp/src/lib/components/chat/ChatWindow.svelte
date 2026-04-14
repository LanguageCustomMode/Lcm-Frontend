<script lang="ts">
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import { tick } from 'svelte';

	interface Message {
		role: 'user' | 'assistant';
		content: string;
	}

	interface Props {
		messages: Message[];
		loading?: boolean;
		onsend?: (message: string) => void;
		suggestion?: Record<string, unknown> | null;
		onaccept?: (spec: Record<string, unknown>) => void;
		onmodify?: (instruction: string) => void;
	}

	let { messages, loading = false, onsend, suggestion = null, onaccept, onmodify }: Props = $props();
	let scrollEl = $state<HTMLDivElement | null>(null);
	let modifyText = $state('');

	$effect(() => {
		const _count = messages.length;
		const _loading = loading;
		if (!scrollEl) return;
		void tick().then(() => {
			scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
		});
	});

	const handleModify = () => {
		if (!modifyText.trim()) return;
		onmodify?.(modifyText.trim());
		modifyText = '';
	};
</script>

<div class="chat-window">
	<div class="messages" bind:this={scrollEl}>
		{#each messages as message, index}
			<ChatMessage role={message.role} content={message.content} />
		{/each}
		{#if loading}
			<div class="chat-message chat-message-assistant">
				<p>Thinking...</p>
			</div>
		{/if}
	</div>

	{#if suggestion}
		<div class="suggestion">
			<div class="suggestion-header">
				<h4>Proposed Activity</h4>
				{#if suggestion.name}<span class="spec-name">{String(suggestion.name)}</span>{/if}
			</div>
			{#if suggestion.type}
				<p class="spec-meta">Type: <strong>{String(suggestion.type).replace(/_/g, ' ')}</strong></p>
			{/if}
			{#if suggestion.description}
				<p class="spec-desc">{String(suggestion.description)}</p>
			{/if}
			<details class="spec-raw">
				<summary>View full spec</summary>
				<pre>{JSON.stringify(suggestion, null, 2)}</pre>
			</details>
			<div class="suggestion-actions">
				<button type="button" on:click={() => onaccept?.(suggestion)}>Accept & Create</button>
				<div class="modify">
					<input
						bind:value={modifyText}
						placeholder="Ask for changes (e.g. add more vocabulary examples)"
					/>
					<button type="button" on:click={handleModify}>Modify</button>
				</div>
			</div>
		</div>
	{/if}

	<ChatInput onsend={onsend} disabled={loading} />
</div>

<style>
	.chat-window {
		display: grid;
		gap: 0.75rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		height: 70vh;
		grid-template-rows: 1fr auto auto;
	}

	.messages {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-right: 0.4rem;
	}

	.chat-message-assistant {
		background: #f6f6f1;
		border-radius: var(--radius);
		padding: 0.6rem 0.75rem;
	}

	.suggestion {
		border: 1px solid #c8dfc5;
		border-radius: var(--radius);
		padding: 0.9rem;
		display: grid;
		gap: 0.6rem;
		background: #f4faf4;
	}

	.suggestion-header {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.suggestion-header h4 {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #4a7c59;
	}

	.spec-name {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.spec-meta {
		font-size: 0.8rem;
		color: #555;
	}

	.spec-desc {
		font-size: 0.85rem;
		color: #444;
	}

	.spec-raw summary {
		font-size: 0.75rem;
		color: #888;
		cursor: pointer;
	}

	.spec-raw pre {
		background: #fff;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.6rem;
		font-size: 0.72rem;
		max-height: 160px;
		overflow: auto;
		margin-top: 0.4rem;
	}

	.suggestion-actions {
		display: grid;
		gap: 0.5rem;
	}

	.suggestion-actions > button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 1rem;
		cursor: pointer;
		justify-self: start;
	}

	.modify {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.modify input {
		flex: 1;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.35rem 0.6rem;
		font-size: 0.85rem;
	}

	.modify button {
		border: 1px solid var(--color-border);
		background: #fff;
		color: #333;
		border-radius: 999px;
		padding: 0.35rem 0.75rem;
		cursor: pointer;
	}
</style>
