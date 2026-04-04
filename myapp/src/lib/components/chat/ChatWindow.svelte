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
			<h4>Suggested Activity Spec</h4>
			<pre>{JSON.stringify(suggestion, null, 2)}</pre>
			<div class="suggestion-actions">
				<button type="button" on:click={() => onaccept?.(suggestion)}>Accept</button>
				<div class="modify">
					<input
						bind:value={modifyText}
						placeholder="Ask for changes (e.g. add more examples)"
					/>
					<button type="button" on:click={handleModify}>Send</button>
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
		border: 1px dashed #d8d8d0;
		border-radius: var(--radius);
		padding: 0.75rem;
		display: grid;
		gap: 0.5rem;
		background: #fdfbf4;
	}

	.suggestion pre {
		background: #fff;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.6rem;
		font-size: 0.75rem;
		max-height: 180px;
		overflow: auto;
	}

	.suggestion-actions {
		display: grid;
		gap: 0.5rem;
	}

	.suggestion-actions button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.35rem 0.8rem;
		cursor: pointer;
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
	}

	.modify button {
		background: #fff;
		color: #333;
	}
</style>
