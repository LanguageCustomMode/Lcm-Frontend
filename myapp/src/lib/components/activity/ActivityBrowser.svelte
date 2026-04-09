<script lang="ts">
	import type { ContentItem } from '$lib/types';
	import CardEditor from '$lib/components/activity/CardEditor.svelte';
	import { renderMarkdown } from '$lib/utils/markdown';

	interface Props {
		items?: ContentItem[];
		activityId?: string;
		onedit?: (item: ContentItem) => void;
		ondelete?: (itemId: string) => void;
	}

	let { items: initialItems = [], activityId, onedit, ondelete }: Props = $props();

	let items = $state<ContentItem[]>(initialItems);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let status = $state<'due' | 'new' | 'learning' | 'review' | 'all'>('all');
	let sort = $state<'due' | 'created' | 'difficulty'>('due');
	let page = $state(1);
	let pageSize = $state(20);
	let editingId = $state<string | null>(null);
	let creating = $state(false);

	// Separate notes from SRS-eligible items
	const notes = $derived(() =>
		items.filter((it) => it.content_type === 'note')
	);

	const srsItems = $derived(() =>
		items.filter((it) => it.content_type !== 'note' && it.content_type !== 'knowledge_component')
	);

	const filteredItems = $derived(() => {
		let list = [...srsItems()];
		if (status !== 'all') {
			list = list.filter((item) => {
				const srs = item.srs_records;
				if (!srs) return false;
				return itemState(srs.state) === status;
			});
		}
		return list;
	});

	const pageCount = $derived(() => Math.max(1, Math.ceil(filteredItems().length / pageSize)));
	const pagedItems = $derived(() => {
		const start = (page - 1) * pageSize;
		return filteredItems().slice(start, start + pageSize);
	});

	const loadItems = async () => {
		if (!activityId) return;
		loading = true;
		error = null;
		try {
			const query = new URLSearchParams();
			query.set('limit', String(200));
			const res = await fetch(`/api/activities/${activityId}/content?${query.toString()}`);
			if (!res.ok) throw new Error(await res.text());
			items = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load content';
		} finally {
			loading = false;
		}
	};

	const itemState = (state: number) => {
		if (state === 0) return 'new';
		if (state === 1) return 'learning';
		if (state === 2) return 'review';
		return 'due';
	};

	const getDisplayText = (item: ContentItem): { primary: string; secondary: string } => {
		const c = item.content as Record<string, unknown>;
		switch (item.content_type) {
			case 'card':
			case 'error':
			case 'audio_card':
				return { primary: String(c.front ?? ''), secondary: String(c.back ?? '') };
			case 'mcq':
				return { primary: String(c.question ?? ''), secondary: `${(c.answers as string[])?.length ?? 0} answers` };
			case 'wildcard':
				return { primary: String(c.text ?? ''), secondary: 'wildcard' };
			case 'sentence':
				return { primary: String(c.sentence ?? ''), secondary: 'sentence' };
			default:
				return { primary: JSON.stringify(c).slice(0, 60), secondary: item.content_type };
		}
	};

	const handleSave = async (payload: { front: string; back: string }) => {
		if (!activityId) return;
		try {
			const res = await fetch(`/api/activities/${activityId}/content`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: [{ content_type: 'card', content: payload }]
				})
			});
			if (!res.ok) throw new Error(await res.text());
			await loadItems();
			creating = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save';
		}
	};

	const handleDelete = async (item: ContentItem) => {
		if (ondelete) {
			ondelete(item.id);
			return;
		}
		try {
			const res = await fetch(`/api/content/${item.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			await loadItems();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete';
		}
	};

	$effect(() => {
		const _status = status;
		const _pageSize = pageSize;
		page = 1;
		if (activityId) loadItems();
	});
</script>

<div class="activity-browser">
	<!-- Notes section -->
	{#if notes().length > 0}
		<div class="notes-section">
			<h3>Notes</h3>
			{#each notes() as note}
				<div class="note-content">
					{@html renderMarkdown(String((note.content as Record<string, unknown>).text ?? ''))}
				</div>
			{/each}
		</div>
	{/if}

	<!-- SRS content items -->
	<div class="header">
		<h3>Content</h3>
		<div class="controls">
			<label>
				Status
				<select bind:value={status}>
					<option value="all">All</option>
					<option value="due">Due</option>
					<option value="new">New</option>
					<option value="learning">Learning</option>
					<option value="review">Review</option>
				</select>
			</label>
			<label>
				Sort
				<select bind:value={sort}>
					<option value="due">Due date</option>
					<option value="created">Created</option>
					<option value="difficulty">Difficulty</option>
				</select>
			</label>
			<label>
				Page size
				<select bind:value={pageSize}>
					<option value="10">10</option>
					<option value="20">20</option>
					<option value="50">50</option>
				</select>
			</label>
			<button type="button" on:click={() => (creating = !creating)}>+ Add Card</button>
		</div>
	</div>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if creating}
		<div class="editor">
			<CardEditor onsave={handleSave} oncancel={() => (creating = false)} />
		</div>
	{/if}

	{#if loading}
		<p>Loading content...</p>
	{:else if pagedItems().length === 0}
		<p>No content found.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Type</th>
					<th>Primary</th>
					<th>Secondary</th>
					<th>Status</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each pagedItems() as item}
					{@const display = getDisplayText(item)}
					<tr>
						<td class="type-badge">{item.content_type}</td>
						<td>{display.primary}</td>
						<td>{display.secondary}</td>
						<td>{item.srs_records ? itemState(item.srs_records.state) : '—'}</td>
						<td class="row-actions">
							<button type="button" on:click={() => handleDelete(item)}>Delete</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	<div class="pagination">
		<button type="button" on:click={() => (page = Math.max(1, page - 1))} disabled={page === 1}>
			Previous
		</button>
		<span>Page {page} of {pageCount()}</span>
		<button
			type="button"
			on:click={() => (page = Math.min(pageCount(), page + 1))}
			disabled={page === pageCount()}
		>
			Next
		</button>
	</div>
</div>

<style>
	.activity-browser {
		display: grid;
		gap: 1rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
	}

	.notes-section {
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 1rem;
		margin-bottom: 0.5rem;
	}

	.note-content {
		font-size: 0.9rem;
		line-height: 1.6;
		padding: 0.75rem;
		background: #fafaf8;
		border-radius: var(--radius);
	}

	.note-content :global(p) {
		margin: 0 0 0.5rem;
	}

	.note-content :global(p:last-child) {
		margin-bottom: 0;
	}

	.note-content :global(pre) {
		margin: 0 0 0.5rem;
		white-space: pre-wrap;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.controls {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
		align-items: flex-end;
	}

	label {
		display: grid;
		gap: 0.2rem;
		font-size: 0.7rem;
		color: #666;
	}

	select {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.25rem 0.4rem;
		font-size: 0.8rem;
	}

	button {
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background: white;
		padding: 0.35rem 0.7rem;
		cursor: pointer;
		font-size: 0.75rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	th,
	td {
		text-align: left;
		border-bottom: 1px solid #eee;
		padding: 0.5rem;
		vertical-align: top;
	}

	.type-badge {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #666;
	}

	.row-actions {
		display: flex;
		gap: 0.4rem;
	}

	.pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8rem;
	}

	.error {
		color: #b42318;
	}

	.editor {
		border: 1px dashed #d8d8d0;
		padding: 0.75rem;
		border-radius: var(--radius);
	}
</style>
