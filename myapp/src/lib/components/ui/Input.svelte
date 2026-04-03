<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
	}

	let { label, error, ...rest }: Props = $props();
</script>

{#if label}
	<label>{label}</label>
{/if}
<input {...rest} />
{#if error}
	<span class="error">{error}</span>
{/if}
