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
<!--
Stub outline:
- Render message list (ChatMessage) with role-based styling.
- Show a "streaming" row when loading is true.
- Provide system/suggestion panel for design accept/modify (when spec present).
- Wire ChatInput to onsend and disable while loading/streaming.
- Autoscroll to newest message on update.
-->
<div class="chat-window">
	<p>{messages.length} messages</p>
</div>
