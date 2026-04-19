<script lang="ts">
	interface Props {
		disabled?: boolean;
		onsend?: (message: string) => void;
	}

	let { disabled = false, onsend }: Props = $props();
	let value = $state('');
</script>

<form onsubmit={(e) => { e.preventDefault(); if (value.trim()) { onsend?.(value); value = ''; } }}>
	<div class="composer" class:disabled>
		<input bind:value placeholder="Type a message…" {disabled} />
		<button type="submit" {disabled}>Send</button>
	</div>
</form>

<style>
	.composer {
		display: flex;
		align-items: center;
		border: 1.5px solid var(--color-border);
		border-radius: 999px;
		overflow: hidden;
		background: white;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.composer:focus-within {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.12);
	}

	.composer.disabled {
		background: #f5f5f5;
	}

	input {
		flex: 1;
		border: none !important;
		box-shadow: none !important;
		border-radius: 0;
		background: transparent;
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
	}

	button {
		flex-shrink: 0;
		border: none;
		background: var(--color-primary);
		color: white;
		padding: 0.5rem 1.1rem;
		font-size: 0.85rem;
		font-weight: 500;
		font-family: inherit;
		cursor: pointer;
		border-radius: 0 999px 999px 0;
		transition: background 0.15s;
		height: 100%;
	}

	button:hover:not(:disabled) {
		background: var(--color-primary-light);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
