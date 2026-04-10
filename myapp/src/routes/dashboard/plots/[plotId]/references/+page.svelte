<script lang="ts">
	let { data } = $props();

	type ReferenceDoc = { id: string; title: string; status: string; chunk_count?: number };
	type ChunkResult = { id: string; content: string; similarity: number };
	type ReadingEstimate = { title: string; total_words: number; estimated_activities: number; words_per_activity: number };

	let references = $state<ReferenceDoc[]>([]);
	let selected = $state<string | null>(null);
	let query = $state('');
	let searchResults = $state<ChunkResult[]>([]);
	let uploading = $state(false);
	let title = $state('');
	let text = $state('');
	let file = $state<File | null>(null);
	let error = $state<string | null>(null);
	let readingEstimate = $state<ReadingEstimate | null>(null);
	let creatingReading = $state(false);

	const handleFileChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		file = input?.files?.[0] ?? null;
	};

	const loadReferences = async () => {
		if (!data.plot) return;
		try {
			const res = await fetch(`/api/plots/${data.plot.id}/references`);
			if (!res.ok) throw new Error(await res.text());
			references = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load references';
		}
	};

	const uploadReference = async () => {
		if (!data.plot) return;
		uploading = true;
		error = null;
		try {
			let body: BodyInit;
			let headers: Record<string, string> = {};

			if (file) {
				const form = new FormData();
				form.append('file', file);
				if (title) form.append('title', title);
				body = form;
			} else {
				if (!text.trim()) {
					throw new Error('Please provide text or choose a file.');
				}
				headers['Content-Type'] = 'application/json';
				body = JSON.stringify({ text, title: title || 'Untitled reference' });
			}

			const endpoint = file
				? `/api/plots/${data.plot.id}/references/upload`
				: `/api/plots/${data.plot.id}/references`;
			const res = await fetch(endpoint, {
				method: 'POST',
				headers,
				body
			});
			if (!res.ok) throw new Error(await res.text());
			title = '';
			text = '';
			file = null;
			await loadReferences();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to upload reference';
		} finally {
			uploading = false;
		}
	};

	const deleteReference = async (refId: string) => {
		if (!data.plot) return;
		try {
			const res = await fetch(`/api/plots/${data.plot.id}/references/${refId}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			references = references.filter((ref) => ref.id !== refId);
			if (selected === refId) {
				selected = null;
				searchResults = [];
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete reference';
		}
	};

	const search = async () => {
		if (!data.plot || !selected || !query.trim()) return;
		try {
			const res = await fetch(
				`/api/plots/${data.plot.id}/references/${selected}/chunks?q=${encodeURIComponent(query)}&limit=10`
			);
			if (!res.ok) throw new Error(await res.text());
			searchResults = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to search reference';
		}
	};

	const estimateReading = async (refId: string) => {
		if (!data.plot) return;
		readingEstimate = null;
		try {
			const res = await fetch(`/api/plots/${data.plot.id}/references/${refId}/reading-estimate`);
			if (!res.ok) throw new Error(await res.text());
			readingEstimate = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to estimate reading';
		}
	};

	const createReading = async (refId: string) => {
		if (!data.plot) return;
		creatingReading = true;
		error = null;
		try {
			const res = await fetch(`/api/plots/${data.plot.id}/references/${refId}/create-reading`, { method: 'POST' });
			if (!res.ok) throw new Error(await res.text());
			readingEstimate = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create reading activities';
		} finally {
			creatingReading = false;
		}
	};

	$effect(() => {
		if (data.plot) loadReferences();
	});
</script>

<h1>References</h1>
<p>Upload reference texts for RAG-powered content generation.</p>

<div class="layout">
	<section class="panel">
		<h2>Upload</h2>
		<label>
			Title
			<input bind:value={title} placeholder="e.g. Reading passage 1" />
		</label>
		<label>
			Text
			<textarea bind:value={text} rows="4" placeholder="Paste text to upload (optional)"></textarea>
		</label>
		<label class="file">
			Upload file
			<input type="file" accept=".txt,.md,.pdf" on:change={handleFileChange} />
		</label>
		<button type="button" disabled={uploading} on:click={uploadReference}>
			{uploading ? 'Uploading...' : 'Upload Reference'}
		</button>
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</section>

	<section class="panel">
		<h2>Library</h2>
		{#if references.length === 0}
			<p>No references uploaded yet.</p>
		{:else}
			<ul class="reference-list">
				{#each references as ref}
					<li>
						<button type="button" on:click={() => (selected = ref.id)} class:active={selected === ref.id}>
							<span>{ref.title}</span>
							<small>{ref.status}</small>
						</button>
						<button type="button" class="reading" on:click={() => estimateReading(ref.id)}>Reading</button>
						<button type="button" class="delete" on:click={() => deleteReference(ref.id)}>Delete</button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	{#if readingEstimate}
		<section class="panel">
			<h2>Create Reading Activities</h2>
			<p>
				<strong>{readingEstimate.title}</strong> — {readingEstimate.total_words} words
				will produce approximately <strong>{readingEstimate.estimated_activities}</strong> reading activities
				(~{readingEstimate.words_per_activity} words each).
			</p>
			<div class="reading-actions">
				<button type="button" disabled={creatingReading} on:click={() => { if (selected) createReading(selected); }}>
					{creatingReading ? 'Creating...' : 'Create Reading Activities'}
				</button>
				<button type="button" class="secondary" on:click={() => readingEstimate = null}>Cancel</button>
			</div>
		</section>
	{/if}

	<section class="panel">
		<h2>Search Chunks</h2>
		<label>
			Reference
			<select bind:value={selected}>
				<option value="">Select reference</option>
				{#each references as ref}
					<option value={ref.id}>{ref.title}</option>
				{/each}
			</select>
		</label>
		<label>
			Query
			<input bind:value={query} placeholder="Search the reference content" />
		</label>
		<button type="button" on:click={search}>Search</button>
		{#if searchResults.length > 0}
			<ul class="results">
				{#each searchResults as result}
					<li>
						<p>{result.content}</p>
						<small>Similarity: {result.similarity.toFixed(2)}</small>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.layout {
		display: grid;
		gap: 1.5rem;
	}

	.panel {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.2rem;
		display: grid;
		gap: 0.6rem;
	}

	label {
		display: grid;
		gap: 0.3rem;
		font-size: 0.8rem;
		color: #555;
	}

	input,
	select,
	textarea {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.4rem 0.6rem;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
	}

	.reference-list {
		list-style: none;
		display: grid;
		gap: 0.5rem;
	}

	.reference-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.reference-list button {
		background: #f6f6f1;
		color: #333;
	}

	.reference-list button.active {
		background: var(--color-primary);
		color: white;
	}

	.reference-list .delete {
		background: #fff;
		color: #b42318;
		border-color: #f4c7c3;
	}

	.results {
		list-style: none;
		display: grid;
		gap: 0.75rem;
	}

	.results li {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.6rem;
		background: #fdfcf6;
	}

	.reference-list .reading {
		background: #27ae60;
		color: white;
		border-color: transparent;
	}

	.reading-actions {
		display: flex;
		gap: 0.5rem;
	}

	.reading-actions .secondary {
		background: #fff;
		color: #333;
	}

	.error {
		color: #b42318;
	}
</style>
