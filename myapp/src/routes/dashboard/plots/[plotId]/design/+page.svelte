<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';

	let { data } = $props();
	let messages: { role: 'user' | 'assistant'; content: string }[] = $state([]);
</script>

<!-- TODO: Design chatbot with SSE streaming -->
<!--
Stub outline:
- On mount, POST /llm/design/start with plot_id (+ optional activity_type).
- Store conversation_id and initial assistant message.
- On send: POST /llm/design/{conversation_id}/message and stream SSE tokens.
- When activity_spec arrives, show accept/modify UI and POST /llm/design/{conversation_id}/accept.
- After accept, redirect to new activity detail or back to grid.
-->
<h1>Design Activity</h1>
<ChatWindow {messages} />
