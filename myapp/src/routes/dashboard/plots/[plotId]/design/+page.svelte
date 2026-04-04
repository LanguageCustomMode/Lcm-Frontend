<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';
	import { fetchSSE } from '$lib/utils/sse';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let messages: { role: 'user' | 'assistant'; content: string }[] = $state([]);
	let loading = $state(false);
	let conversationId = $state<string | null>(null);
	let suggestion = $state<Record<string, unknown> | null>(null);
	let error = $state<string | null>(null);

	const startConversation = async () => {
		if (!data.plot) return;
		const activityType = $page.url.searchParams.get('activity_type');
		const parentActivityId = $page.url.searchParams.get('parent_activity_id');
		const existingConversation = $page.url.searchParams.get('conversation_id');

		try {
			if (existingConversation) {
				const res = await fetch(`/api/llm/design/${existingConversation}`);
				if (res.ok) {
					const convo = await res.json();
					conversationId = convo.id ?? existingConversation;
					messages = convo.messages ?? [];
					suggestion = convo.current_spec ?? null;
					return;
				}
			}

			const res = await fetch('/api/llm/design/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					plot_id: data.plot.id,
					activity_type: activityType || undefined,
					parent_activity_id: parentActivityId || undefined
				})
			});
			if (!res.ok) {
				error = await res.text();
				return;
			}
			const payload = await res.json();
			conversationId = payload.conversation_id;
			messages = [{ role: 'assistant', content: payload.assistant_message }];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start design chat';
		}
	};

	const sendMessage = async (message: string) => {
		if (!conversationId) return;
		error = null;
		messages = [...messages, { role: 'user', content: message }, { role: 'assistant', content: '' }];
		const assistantIndex = messages.length - 1;
		loading = true;
		let buffer = '';

		try {
			console.debug('[design] sendMessage', { conversationId, messageLen: message.length });
			for await (const event of fetchSSE(
				`/api/llm/design/${conversationId}/message`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ message })
				},
				true
			)) {
				console.debug('[design] sse event', event);
				if (event.event === 'token') {
					buffer = `${buffer}${buffer ? ' ' : ''}${event.data}`;
					messages = messages.map((msg, idx) =>
						idx === assistantIndex ? { ...msg, content: buffer } : msg
					);
				}
				if (event.event === 'suggestion') {
					try {
						suggestion = JSON.parse(event.data);
					} catch {
						suggestion = { raw: event.data };
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

	const acceptSuggestion = async (spec: Record<string, unknown>) => {
		if (!conversationId) return;
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/llm/design/${conversationId}/accept`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spec })
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			await goto(`/dashboard/plots/${data.plot?.id}/activities/${payload.activity_id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to accept suggestion';
		} finally {
			loading = false;
		}
	};

	const modifySuggestion = (instruction: string) => {
		suggestion = null;
		sendMessage(instruction);
	};

	onMount(startConversation);
</script>

<h1>Design Activity</h1>
{#if error}
	<p class="error">{error}</p>
{/if}
<ChatWindow {messages} {loading} onsend={sendMessage} suggestion={suggestion} onaccept={acceptSuggestion} onmodify={modifySuggestion} />

<style>
	.error {
		color: #b42318;
		margin-bottom: 0.5rem;
	}
</style>
