<script lang="ts">
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import { apiPost } from '$lib/api';
	import { fetchSSE } from '$lib/utils/sse';
	import { tick } from 'svelte';

	interface Props {
		activityId: string;
	}

	let { activityId }: Props = $props();

	type Message = { role: 'user' | 'assistant'; content: string };

	let conversationId = $state<string | null>(null);
	let messages = $state<Message[]>([]);
	let loading = $state(false);
	let modifications = $state<any[] | null>(null);
	let recommendation = $state<string>('modify');
	let applying = $state(false);
	let scrollEl = $state<HTMLDivElement | null>(null);

	const startConversation = async () => {
		try {
			const res = await apiPost<{ conversation_id: string; assistant_message: string }>('/llm/modify/start', {
				activity_id: activityId,
			});
			conversationId = res.conversation_id;
			messages = [{ role: 'assistant', content: res.assistant_message }];
		} catch (e: any) {
			messages = [{ role: 'assistant', content: 'Failed to start modification chat. Please try again.' }];
		}
	};

	$effect(() => {
		startConversation();
	});

	$effect(() => {
		const _count = messages.length;
		if (!scrollEl) return;
		void tick().then(() => {
			scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
		});
	});

	const sendMessage = async (text: string) => {
		if (!conversationId || loading) return;
		messages = [...messages, { role: 'user', content: text }];
		loading = true;
		modifications = null;

		let assistantText = '';
		try {
			for await (const event of fetchSSE(`/api/llm/modify/${conversationId}/message`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: text }),
			})) {
				if (event.event === 'token') {
					try {
						assistantText = JSON.parse(event.data);
					} catch {
						assistantText = event.data;
					}
				} else if (event.event === 'suggestion') {
					try {
						const payload = JSON.parse(event.data);
						modifications = payload.modifications;
						recommendation = payload.recommendation;
					} catch { /* ignore */ }
				}
			}
			messages = [...messages, { role: 'assistant', content: assistantText }];
		} catch (e: any) {
			messages = [...messages, { role: 'assistant', content: 'Error: ' + e.message }];
		}
		loading = false;
	};

	const approveModifications = async () => {
		if (!conversationId || !modifications) return;
		applying = true;
		try {
			const res = await apiPost<{ applied: number }>(`/llm/modify/${conversationId}/approve`, {
				modifications,
			});
			messages = [...messages, { role: 'assistant', content: `Applied ${res.applied} modification(s). The content has been updated.` }];
			modifications = null;
		} catch (e: any) {
			messages = [...messages, { role: 'assistant', content: 'Failed to apply: ' + (e.detail || e.message) }];
		}
		applying = false;
	};

	const rejectModifications = async () => {
		modifications = null;
		if (conversationId) {
			await apiPost(`/llm/modify/${conversationId}/reject`, {}).catch(() => {});
		}
		messages = [...messages, { role: 'assistant', content: "No problem. Tell me more about what you'd like changed." }];
	};
</script>

<div class="modify-chat">
	<div class="chat-header">
		<h3>Modify Activity</h3>
	</div>
	<div class="messages" bind:this={scrollEl}>
		{#each messages as message}
			<ChatMessage role={message.role} content={message.content} />
		{/each}
		{#if loading}
			<div class="thinking">Thinking...</div>
		{/if}
	</div>

	{#if modifications}
		<div class="suggestions">
			{#if recommendation === 'new_activity' || recommendation === 'extension'}
				<p class="rec-warning">The changes are too significant for in-place modification. Consider creating a {recommendation === 'extension' ? 'new extension' : 'new activity'} instead.</p>
			{/if}
			<h4>Suggested Changes ({modifications.length})</h4>
			<div class="mod-list">
				{#each modifications as mod}
					<div class="mod-item">
						<span class="mod-action">{mod.action}</span>
						<span class="mod-type">{mod.content_type}</span>
						{#if mod.field}
							<span class="mod-field">{mod.field}</span>
						{/if}
						{#if mod.old_value}
							<div class="mod-diff">
								<del>{mod.old_value}</del>
								{#if mod.new_value}<ins>{mod.new_value}</ins>{/if}
							</div>
						{:else if mod.new_value}
							<div class="mod-diff"><ins>{mod.new_value}</ins></div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="suggestion-actions">
				<button type="button" onclick={approveModifications} disabled={applying}>
					{applying ? 'Applying...' : 'Approve All'}
				</button>
				<button type="button" class="secondary" onclick={rejectModifications}>Reject</button>
			</div>
		</div>
	{/if}

	<ChatInput onsend={sendMessage} disabled={loading} />
</div>

<style>
	.modify-chat {
		display: grid;
		grid-template-rows: auto 1fr auto auto;
		gap: 0.5rem;
		height: 100%;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.75rem;
	}

	.chat-header h3 {
		margin: 0;
		font-size: 0.9rem;
	}

	.messages {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 200px;
		max-height: 50vh;
	}

	.thinking {
		font-size: 0.8rem;
		color: #888;
		padding: 0.4rem 0.6rem;
		background: #f6f6f1;
		border-radius: var(--radius);
		align-self: flex-start;
	}

	.suggestions {
		border: 1px dashed #d8d8d0;
		border-radius: var(--radius);
		padding: 0.6rem;
		background: #fdfbf4;
		display: grid;
		gap: 0.4rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.suggestions h4 {
		margin: 0;
		font-size: 0.8rem;
	}

	.rec-warning {
		font-size: 0.8rem;
		color: #e65100;
		background: #fff3e0;
		padding: 0.4rem;
		border-radius: var(--radius);
		margin: 0;
	}

	.mod-list {
		display: grid;
		gap: 0.3rem;
	}

	.mod-item {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		align-items: center;
		font-size: 0.75rem;
	}

	.mod-action {
		background: #e3f2fd;
		padding: 0.1rem 0.35rem;
		border-radius: 999px;
		font-size: 0.65rem;
		text-transform: uppercase;
	}

	.mod-type {
		color: #666;
	}

	.mod-field {
		color: #888;
		font-style: italic;
	}

	.mod-diff {
		width: 100%;
		font-size: 0.75rem;
	}

	.mod-diff del {
		color: #b42318;
		text-decoration: line-through;
	}

	.mod-diff ins {
		color: #2e7d32;
		text-decoration: none;
		background: #e8f5e9;
	}

	.suggestion-actions {
		display: flex;
		gap: 0.4rem;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.3rem 0.7rem;
		cursor: pointer;
		font-size: 0.75rem;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.secondary {
		background: #fff;
		color: #333;
	}
</style>
