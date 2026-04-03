<script lang="ts">
	interface Props {
		disabled?: boolean;
		onsend?: (message: string) => void;
	}

	let { disabled = false, onsend }: Props = $props();
	let value = $state('');
</script>

<form onsubmit={(e) => { e.preventDefault(); if (value.trim()) { onsend?.(value); value = ''; } }}>
	<input bind:value placeholder="Type a message..." {disabled} />
	<button type="submit" {disabled}>Send</button>
</form>
