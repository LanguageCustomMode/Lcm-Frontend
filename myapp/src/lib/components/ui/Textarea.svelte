<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTextareaAttributes, 'value'> {
		label?: string;
		error?: string;
		value?: string;
	}

	let { label, error, value = $bindable(''), ...rest }: Props = $props();
</script>

<div class="field">
	{#if label}
		<label>{label}</label>
	{/if}
	<textarea {...rest} bind:value class:input-error={error}></textarea>
	{#if error}
		<span class="error">{error}</span>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	label {
		font-size: 0.8rem;
		font-weight: 500;
		color: #555;
	}

	textarea {
		resize: vertical;
		min-height: 80px;
	}

	.input-error {
		border-color: #e53935 !important;
	}

	.error {
		font-size: 0.75rem;
		color: #b42318;
	}
</style>
