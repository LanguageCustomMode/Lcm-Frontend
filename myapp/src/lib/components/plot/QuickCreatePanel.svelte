<script lang="ts">
	import type { ActivityType } from '$lib/types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface WishlistItem {
		id: string;
		title: string;
		activity_type: ActivityType | null;
		rag_source_id: string | null;
		notes: string;
		status: string;
	}

	interface RagSource {
		id: string;
		title: string;
		status: string;
	}

	interface Props {
		plotId: string;
		row: number;
		col: number;
		onclose?: () => void;
		oncreated?: (activityId: string) => void;
	}

	let { plotId, row, col, onclose, oncreated }: Props = $props();

	let wishlist = $state<WishlistItem[]>([]);
	let references = $state<RagSource[]>([]);
	let title = $state('');
	let type: ActivityType = $state('vocabulary');
	let ragSourceId = $state<string>('');
	let wishlistItemId = $state<string | null>(null);
	let saving = $state(false);
	let error = $state<string | null>(null);

	const needsRag = $derived(
		type === 'reading' ||
			type === 'fundamentals' ||
			type === 'grammar_theory' ||
			type === 'grammar_processing' ||
			type === 'grammar_manipulations' ||
			type === 'cultural_knowledge'
	);

	const load = async () => {
		const [w, r] = await Promise.all([
			fetch(`/api/plots/${plotId}/wishlist`).then((res) => (res.ok ? res.json() : [])),
			fetch(`/api/plots/${plotId}/references`).then((res) => (res.ok ? res.json() : []))
		]);
		wishlist = w;
		references = r;
	};

	const pickWishlistItem = (item: WishlistItem) => {
		wishlistItemId = item.id;
		title = item.title;
		if (item.activity_type) type = item.activity_type;
		if (item.rag_source_id) ragSourceId = item.rag_source_id;
	};

	const removeWishlistItem = async (item: WishlistItem, e: Event) => {
		e.stopPropagation();
		await fetch(`/api/plots/${plotId}/wishlist/${item.id}`, { method: 'DELETE' });
		wishlist = wishlist.filter((w) => w.id !== item.id);
		if (wishlistItemId === item.id) wishlistItemId = null;
	};

	const submit = async () => {
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}
		saving = true;
		error = null;
		try {
			const body: Record<string, unknown> = {
				name: title.trim(),
				type,
				grid_positions: [[row, col]]
			};
			if (ragSourceId) body.rag_source_id = ragSourceId;
			if (wishlistItemId) body.wishlist_item_id = wishlistItemId;
			const res = await fetch(`/api/plots/${plotId}/activities/quick`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			oncreated?.(payload.id);
			await goto(`/dashboard/plots/${plotId}/activities/${payload.id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create activity';
		} finally {
			saving = false;
		}
	};

	onMount(load);
</script>

<div class="quick-create">
	<div class="panel wishlist-panel">
		<div class="panel-header">
			<h3>Wishlist</h3>
			<span class="count">{wishlist.length}</span>
		</div>
		{#if wishlist.length === 0}
			<p class="empty">No wishlist items yet. The Design chat can add them, or create directly →</p>
		{:else}
			<ul>
				{#each wishlist as item}
					<li
						class:selected={wishlistItemId === item.id}
						onclick={() => pickWishlistItem(item)}
						role="button"
						tabindex="0"
					>
						<div class="item-title">{item.title}</div>
						{#if item.activity_type}
							<div class="item-type">{item.activity_type.replace(/_/g, ' ')}</div>
						{/if}
						{#if item.notes}<div class="item-notes">{item.notes}</div>{/if}
						<button
							class="remove"
							type="button"
							onclick={(e) => removeWishlistItem(item, e)}
							title="Remove"
						>
							×
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="panel form-panel">
		<div class="panel-header">
			<h3>New Activity</h3>
			<span class="cell-label">Cell [{row}, {col}]</span>
		</div>
		<label>
			Title
			<input bind:value={title} placeholder="Describe the activity" />
		</label>
		<label>
			Type
			<select bind:value={type}>
				<optgroup label="General Knowledge">
					<option value="fundamentals">Fundamentals</option>
					<option value="cultural_knowledge">Cultural Knowledge</option>
				</optgroup>
				<optgroup label="Lexical Skills">
					<option value="vocabulary">Vocabulary</option>
					<option value="template_sentences">Template Sentences</option>
					<option value="listening">Listening</option>
					<option value="pronunciation">Pronunciation</option>
				</optgroup>
				<optgroup label="Grammar">
					<option value="grammar_theory">Theory</option>
					<option value="grammar_processing">Processing</option>
					<option value="grammar_manipulations">Manipulations</option>
				</optgroup>
				<optgroup label="Activities">
					<option value="reading">Reading</option>
					<option value="dialogue">Dialogue</option>
					<option value="writing_practice">Writing</option>
				</optgroup>
			</select>
		</label>
		{#if needsRag}
			<label>
				RAG source
				<select bind:value={ragSourceId}>
					<option value="">— none —</option>
					{#each references as r}
						<option value={r.id}>{r.title}</option>
					{/each}
				</select>
			</label>
		{/if}
		{#if error}<p class="error">{error}</p>{/if}
		<div class="actions">
			<button type="button" class="ghost" onclick={() => onclose?.()}>Cancel</button>
			<button type="button" disabled={saving} onclick={submit}>
				{saving ? 'Creating…' : 'Create activity'}
			</button>
		</div>
	</div>
</div>

<style>
	.quick-create {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		min-width: min(860px, 90vw);
	}
	.panel {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		min-height: 340px;
		max-height: 60vh;
		overflow: hidden;
	}
	.wishlist-panel {
		background: white;
	}
	.form-panel {
		background: white;
	}
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.panel-header h3 {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #4a7c59;
		margin: 0;
	}
	.count,
	.cell-label {
		font-size: 0.75rem;
		color: #888;
	}
	.wishlist-panel ul {
		list-style: none;
		padding: 0;
		margin: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.wishlist-panel li {
		position: relative;
		padding: 0.6rem 0.7rem;
		background: #fffef8;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		cursor: pointer;
	}
	.wishlist-panel li.selected {
		border-color: var(--color-primary);
		background: #eef8ef;
	}
	.item-title {
		font-size: 0.85rem;
		font-weight: 500;
	}
	.item-type {
		font-size: 0.72rem;
		color: #666;
		text-transform: capitalize;
	}
	.item-notes {
		font-size: 0.75rem;
		color: #555;
		margin-top: 0.2rem;
	}
	.remove {
		position: absolute;
		top: 4px;
		right: 6px;
		border: none;
		background: transparent;
		font-size: 1rem;
		color: #999;
		cursor: pointer;
		line-height: 1;
	}
	.form-panel label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: #555;
	}
	.form-panel input,
	.form-panel select {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.4rem 0.55rem;
		font-size: 0.85rem;
		font-family: inherit;
	}
	.actions {
		margin-top: auto;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	.actions button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 1rem;
		font-size: 0.8rem;
		cursor: pointer;
	}
	.actions button.ghost {
		background: transparent;
		color: #444;
	}
	.empty {
		color: #888;
		font-size: 0.82rem;
	}
	.error {
		color: #b42318;
		font-size: 0.78rem;
	}
</style>
