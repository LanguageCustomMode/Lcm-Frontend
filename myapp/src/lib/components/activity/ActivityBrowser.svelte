<script lang="ts">
	import type { Card } from '$lib/types';
	import CardEditor from '$lib/components/activity/CardEditor.svelte';

	interface Props {
		cards?: Card[];
		activityId?: string;
		onedit?: (card: Card) => void;
		ondelete?: (cardId: string) => void;
	}

	let { cards: initialCards = [], activityId, onedit, ondelete }: Props = $props();

	let cards = $state<Card[]>(initialCards);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let status = $state<'due' | 'new' | 'learning' | 'review' | 'all'>('all');
	let sort = $state<'due' | 'created' | 'difficulty'>('due');
	let page = $state(1);
	let pageSize = $state(20);
	let editingId = $state<string | null>(null);
	let creating = $state(false);

	const filteredCards = $derived(() => {
		let list = [...cards];
		if (status !== 'all') {
			list = list.filter((card) => cardState(card.state) === status);
		}
		if (sort === 'due') {
			list.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
		}
		if (sort === 'created') {
			list.sort((a, b) => a.id.localeCompare(b.id));
		}
		if (sort === 'difficulty') {
			list.sort((a, b) => (b as any).difficulty - (a as any).difficulty);
		}
		return list;
	});

	const pageCount = $derived(() => Math.max(1, Math.ceil(filteredCards().length / pageSize)));
	const pagedCards = $derived(() => {
		const start = (page - 1) * pageSize;
		return filteredCards().slice(start, start + pageSize);
	});

	const loadCards = async () => {
		if (!activityId) return;
		loading = true;
		error = null;
		try {
			const query = new URLSearchParams();
			if (status !== 'all') query.set('status', status);
			query.set('limit', String(pageSize));
			const res = await fetch(`/api/activities/${activityId}/cards?${query.toString()}`);
			if (!res.ok) throw new Error(await res.text());
			cards = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load cards';
		} finally {
			loading = false;
		}
	};

	const cardState = (state: number) => {
		if (state === 0) return 'new';
		if (state === 1) return 'learning';
		if (state === 2) return 'review';
		return 'due';
	};

	const handleSave = async (payload: { front: string; back: string; extra_fields?: Record<string, unknown> }) => {
		if (!activityId) return;
		try {
			const res = await fetch(`/api/activities/${activityId}/cards`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cards: [payload] })
			});
			if (!res.ok) throw new Error(await res.text());
			await loadCards();
			creating = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save card';
		}
	};

	const handleEdit = async (card: Card, payload: { front: string; back: string }) => {
		if (onedit) {
			onedit(card);
			return;
		}
		try {
			const res = await fetch(`/api/cards/${card.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(await res.text());
			await loadCards();
			editingId = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update card';
		}
	};

	const handleDelete = async (card: Card) => {
		if (ondelete) {
			ondelete(card.id);
			return;
		}
		try {
			const res = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			await loadCards();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete card';
		}
	};

	$effect(() => {
		const _status = status;
		const _pageSize = pageSize;
		page = 1;
		if (activityId) loadCards();
	});
</script>

<div class="activity-browser">
	<div class="header">
		<h3>Cards</h3>
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
		<p>Loading cards...</p>
	{:else if pagedCards().length === 0}
		<p>No cards found.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Front</th>
					<th>Back</th>
					<th>Status</th>
					<th>Due</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each pagedCards() as card}
					<tr>
						<td>
							{#if editingId === card.id}
								<CardEditor
									card={card}
									onsave={(payload) => handleEdit(card, payload)}
									oncancel={() => (editingId = null)}
								/>
							{:else}
								{card.front}
							{/if}
						</td>
						<td>{editingId === card.id ? '' : card.back}</td>
						<td>{cardState(card.state)}</td>
						<td>{new Date(card.due).toLocaleDateString()}</td>
						<td class="row-actions">
							{#if editingId !== card.id}
								<button type="button" on:click={() => (editingId = card.id)}>Edit</button>
								<button type="button" on:click={() => handleDelete(card)}>Delete</button>
							{/if}
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
