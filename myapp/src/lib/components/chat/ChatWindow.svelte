<script lang="ts">
	interface Message {
		role: 'user' | 'assistant';
		content: string;
	}

	interface Props {
		messages: Message[];
		loading?: boolean;
		onsend?: (message: string) => void;
	}

	let { messages, loading = false, onsend }: Props = $props();
</script>

<!-- TODO: Chat window for design + interact -->
<div class="chat-window">
	<p>{messages.length} messages</p>
</div>
