<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends Omit<HTMLSelectAttributes, 'value'> {
		label?: string;
		error?: string;
		value?: string;
		children: Snippet;
	}

	let { label, error, value = $bindable(''), children, ...rest }: Props = $props();
</script>

<div class="field">
	{#if label}
		<label>{label}</label>
	{/if}
	<select {...rest} bind:value class:input-error={error}>
		{@render children()}
	</select>
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

	select {
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.7rem center;
		padding-right: 2rem;
	}

	.input-error {
		border-color: #e53935 !important;
	}

	.error {
		font-size: 0.75rem;
		color: #b42318;
	}
</style>
