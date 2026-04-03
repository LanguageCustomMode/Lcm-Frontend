<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';

	let { data } = $props();
	let messages: { role: 'user' | 'assistant'; content: string }[] = $state([]);
</script>

<!-- TODO: Interaction tutor with SSE streaming -->
<!--
Stub outline:
- Start session: POST /llm/interact/{activity_id}/start -> { session_id, opening_message }.
- Append opening_message to messages.
- On send: POST /llm/interact/{session_id}/message and stream SSE tokens + corrections.
- Surface corrections/errors inline in the chat UI.
- End session: POST /llm/interact/{session_id}/end (no body) -> { summary, errors_collected, xp_earned }.
-->
<h1>Practice</h1>
<ChatWindow {messages} />
