<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';

	let { data } = $props();
	let messages: { role: 'user' | 'assistant'; content: string }[] = $state([]);
</script>

<!-- TODO: Interaction tutor with SSE streaming -->
<h1>Practice</h1>
<ChatWindow {messages} />
