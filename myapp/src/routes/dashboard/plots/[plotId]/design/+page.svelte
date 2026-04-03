<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';

	let { data } = $props();
	let messages: { role: 'user' | 'assistant'; content: string }[] = $state([]);
</script>

<!-- TODO: Design chatbot with SSE streaming -->
<h1>Design Activity</h1>
<ChatWindow {messages} />
