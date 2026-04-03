<script lang="ts">
	interface Props {
		role: 'user' | 'assistant';
		content: string;
	}

	let { role, content }: Props = $props();
</script>

<div class="chat-message chat-message-{role}">
	<p>{content}</p>
</div>
