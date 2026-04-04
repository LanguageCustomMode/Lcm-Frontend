<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';
	import { fetchSSE } from '$lib/utils/sse';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let { data } = $props();
	let messages: { role: 'user' | 'assistant'; content: string }[] = $state([]);
	let loading = $state(false);
	let sessionId = $state<string | null>(null);
	let corrections = $state<Record<string, unknown>[]>([]);
	let error = $state<string | null>(null);

	const startSession = async () => {
		try {
			const res = await fetch(`/api/llm/interact/${$page.params.activityId}/start`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			sessionId = payload.session_id;
			messages = [{ role: 'assistant', content: payload.opening_message }];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start session';
		}
	};

	const sendMessage = async (message: string) => {
		if (!sessionId) return;
		error = null;
		messages = [...messages, { role: 'user', content: message }, { role: 'assistant', content: '' }];
		const assistantIndex = messages.length - 1;
		let buffer = '';
		loading = true;

		try {
			console.debug('[interact] sendMessage', { sessionId, messageLen: message.length });
			for await (const event of fetchSSE(
				`/api/llm/interact/${sessionId}/message`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ message })
				},
				true
			)) {
				console.debug('[interact] sse event', event);
				if (event.event === 'token') {
					buffer += event.data;
					messages = messages.map((msg, idx) =>
						idx === assistantIndex ? { ...msg, content: buffer } : msg
					);
				}
				if (event.event === 'correction') {
					try {
						const parsed = JSON.parse(event.data);
						corrections = Array.isArray(parsed) ? parsed : [parsed];
					} catch {
						corrections = [{ raw: event.data }];
					}
				}
				if (event.event === 'done') {
					loading = false;
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to send message';
		} finally {
			loading = false;
		}
	};

	const endSession = async () => {
		if (!sessionId) return;
		try {
			await fetch(`/api/llm/interact/${sessionId}/end`, { method: 'POST' });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to end session';
		}
	};

	onMount(startSession);
</script>

<h1>Practice</h1>
{#if error}
	<p class="error">{error}</p>
{/if}
<div class="practice-layout">
	<ChatWindow {messages} {loading} onsend={sendMessage} />
	<div class="panel">
		<h3>Corrections</h3>
		{#if corrections.length === 0}
			<p>No corrections yet.</p>
		{:else}
			<ul>
				{#each corrections as item}
					<li>{JSON.stringify(item)}</li>
				{/each}
			</ul>
		{/if}
		<button type="button" onclick={endSession}>End Session</button>
	</div>
</div>

<style>
	.practice-layout {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1rem;
		align-items: start;
	}

	.panel {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
	}

	.panel ul {
		list-style: none;
		display: grid;
		gap: 0.5rem;
		font-size: 0.75rem;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
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
