<script lang="ts">
	interface Props {
		label?: string;
		checked?: boolean;
		name?: string;
		disabled?: boolean;
	}

	let { label, checked = $bindable(false), name, disabled = false }: Props = $props();
</script>

<label class="checkbox-field" class:disabled>
	<input type="checkbox" {name} {disabled} bind:checked />
	<span class="box" class:checked>
		{#if checked}
			<svg viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M1 4l3 3 5-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		{/if}
	</span>
	{#if label}
		<span class="label-text">{label}</span>
	{/if}
</label>

<style>
	.checkbox-field {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.55rem 0.75rem;
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius);
		background: #fff;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
		font-size: 0.9rem;
		color: var(--color-text);
		user-select: none;
	}

	.checkbox-field:focus-within {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.12);
	}

	.checkbox-field.disabled {
		background: #f5f5f5;
		cursor: not-allowed;
		opacity: 0.7;
	}

	input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	.box {
		flex-shrink: 0;
		width: 1rem;
		height: 1rem;
		border: 1.5px solid var(--color-border);
		border-radius: 4px;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.12s, border-color 0.12s;
		color: #fff;
	}

	.box.checked {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}

	.box svg {
		width: 0.6rem;
		height: 0.6rem;
	}

	.label-text {
		line-height: 1.4;
	}
</style>
