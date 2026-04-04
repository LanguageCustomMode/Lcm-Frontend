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

<style>
	.chat-message {
		max-width: 75%;
		padding: 0.6rem 0.75rem;
		border-radius: 14px;
		font-size: 0.9rem;
		line-height: 1.4;
		background: #f6f6f1;
	}

	.chat-message-user {
		align-self: flex-end;
		background: var(--color-primary);
		color: white;
	}

	.chat-message-assistant {
		align-self: flex-start;
		background: #f3f1ea;
		color: #222;
	}
</style>
