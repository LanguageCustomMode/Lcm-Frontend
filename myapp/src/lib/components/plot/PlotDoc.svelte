<script lang="ts">
	import { renderMarkdown } from '$lib/utils/markdown';
	import { onMount } from 'svelte';

	interface Props {
		plotId: string;
	}

	let { plotId }: Props = $props();
	let markdown = $state('');
	let editing = $state(false);
	let draft = $state('');
	let saving = $state(false);
	let error = $state<string | null>(null);

	const load = async () => {
		try {
			const res = await fetch(`/api/plots/${plotId}/doc`);
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			markdown = payload.markdown_content ?? '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load plot doc';
		}
	};

	const beginEdit = () => {
		draft = markdown;
		editing = true;
	};

	const save = async () => {
		saving = true;
		error = null;
		try {
			const res = await fetch(`/api/plots/${plotId}/doc`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ markdown_content: draft })
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			markdown = payload.markdown_content ?? '';
			editing = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save';
		} finally {
			saving = false;
		}
	};

	export const applyRemoteUpdate = (next: string) => {
		markdown = next;
		if (editing) draft = next;
	};

	onMount(load);
</script>

<div class="plot-doc">
	<div class="doc-header">
		<h3>Plot Doc</h3>
		{#if editing}
			<div class="actions">
				<button type="button" disabled={saving} onclick={save}>{saving ? 'Saving…' : 'Save'}</button>
				<button type="button" class="ghost" onclick={() => (editing = false)}>Cancel</button>
			</div>
		{:else}
			<button type="button" class="ghost" onclick={beginEdit}>Edit</button>
		{/if}
	</div>
	{#if error}
		<p class="error">{error}</p>
	{/if}
	{#if editing}
		<textarea bind:value={draft} rows="18" placeholder="Write the overview goal for how you'll structure your learning in this plot…"></textarea>
	{:else if markdown.trim()}
		<div class="rendered">{@html renderMarkdown(markdown)}</div>
	{:else}
		<p class="empty">No plot doc yet. Use the Design chat, or click Edit to draft one.</p>
	{/if}
</div>

<style>
	.plot-doc {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		height: 70vh;
		overflow: hidden;
	}
	.doc-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.doc-header h3 {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #4a7c59;
		margin: 0;
	}
	.actions {
		display: flex;
		gap: 0.35rem;
	}
	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.3rem 0.8rem;
		font-size: 0.75rem;
		cursor: pointer;
	}
	button.ghost {
		background: transparent;
		color: #444;
	}
	textarea {
		flex: 1;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.6rem;
		font-family: inherit;
		font-size: 0.85rem;
		resize: none;
	}
	.rendered {
		flex: 1;
		overflow-y: auto;
		font-size: 0.9rem;
		line-height: 1.5;
	}
	.rendered :global(h1),
	.rendered :global(h2),
	.rendered :global(h3) {
		margin: 0.6rem 0 0.3rem;
	}
	.rendered :global(p) {
		margin: 0.35rem 0;
	}
	.rendered :global(ul),
	.rendered :global(ol) {
		margin: 0.3rem 0 0.3rem 1.2rem;
	}
	.empty {
		color: #888;
		font-size: 0.85rem;
	}
	.error {
		color: #b42318;
		font-size: 0.8rem;
	}
</style>
