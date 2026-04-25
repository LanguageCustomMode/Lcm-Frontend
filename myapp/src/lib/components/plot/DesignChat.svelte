<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';
	import { fetchSSE } from '$lib/utils/sse';
	import { onMount } from 'svelte';
	import { goto, invalidate } from '$app/navigation';

	interface Props {
		plotId: string;
		onplotdocupdate?: (markdown: string) => void;
		onwishlistadd?: (items: unknown[]) => void;
	}

	let { plotId, onplotdocupdate, onwishlistadd }: Props = $props();
	let messages: { role: 'user' | 'assistant'; content: string }[] = $state([]);
	let loading = $state(false);
	let conversationId = $state<string | null>(null);
	let suggestion = $state<Record<string, unknown> | null>(null);
	let error = $state<string | null>(null);

	const resumeOrStart = async () => {
		try {
			const res = await fetch(`/api/llm/design/plot/${plotId}/resume`, { method: 'POST' });
			if (!res.ok) {
				error = await res.text();
				return;
			}
			const payload = await res.json();
			conversationId = payload.conversation_id;
			if (payload.conversation_id) {
				const convo = await fetch(`/api/llm/design/${payload.conversation_id}`).then((r) =>
					r.ok ? r.json() : null
				);
				if (convo) {
					messages = (convo.messages ?? []).map((m: any) => ({
						role: m.role === 'assistant' ? 'assistant' : 'user',
						content: m.content ?? ''
					}));
					suggestion = convo.current_spec ?? null;
					return;
				}
			}
			if (payload.assistant_message) {
				messages = [{ role: 'assistant', content: payload.assistant_message }];
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to open design chat';
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
			for await (const event of fetchSSE(
				`/api/llm/design/${conversationId}/message`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ message })
				},
				true
			)) {
				if (event.event === 'token') {
					buffer += event.data;
					messages = messages.map((msg, idx) =>
						idx === assistantIndex ? { ...msg, content: buffer } : msg
					);
				}
				if (event.event === 'suggestion') {
					try {
						suggestion = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
					} catch {
						suggestion = null;
					}
				}
				if (event.event === 'plot_doc_update') {
					try {
						const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
						if (payload?.markdown_content != null) onplotdocupdate?.(payload.markdown_content);
					} catch {
						/* ignore */
					}
				}
				if (event.event === 'wishlist_add') {
					try {
						const items = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
						if (Array.isArray(items)) onwishlistadd?.(items);
					} catch {
						/* ignore */
					}
				}
				if (event.event === 'done') loading = false;
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
		try {
			const res = await fetch(`/api/llm/design/${conversationId}/accept`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spec })
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			await invalidate(`app:plot:${plotId}`);
			await goto(`/dashboard/plots/${plotId}/activities/${payload.activity_id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to accept';
		} finally {
			loading = false;
		}
	};

	const modifySuggestion = (instruction: string) => {
		suggestion = null;
		sendMessage(instruction);
	};

	onMount(resumeOrStart);
</script>

<div class="design-chat">
	{#if error}
		<p class="error">{error}</p>
	{/if}
	<ChatWindow
		{messages}
		{loading}
		onsend={sendMessage}
		{suggestion}
		onaccept={acceptSuggestion}
		onmodify={modifySuggestion}
	/>
</div>

<style>
	.design-chat {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.error {
		color: #b42318;
		font-size: 0.8rem;
	}
</style>
