<script lang="ts">
	import type { Idea } from '$lib/types';

	interface Props {
		ideas: Idea[];
		onselect?: (idea: Idea) => void;
		ondelete?: (idea: Idea) => void;
	}

	let { ideas, onselect, ondelete }: Props = $props();

	const formatType = (value?: string) => value ? value.replace(/_/g, ' ') : '';

	// Group ideas by tag
	const grouped = $derived(() => {
		const groups = new Map<string, Idea[]>();
		for (const idea of ideas) {
			if (idea.claimed_activity_id) continue; // Skip claimed ideas
			const tag = idea.tag || 'ungrouped';
			if (!groups.has(tag)) groups.set(tag, []);
			groups.get(tag)!.push(idea);
		}
		return groups;
	});

	const tagColors: Record<string, string> = {
		basics: '#4a90d9',
		conversation: '#e67e22',
		reading: '#27ae60',
		grammar: '#8e44ad',
		culture: '#e74c3c',
		ungrouped: '#95a5a6',
	};

	const colorForTag = (tag: string) => {
		const key = tag.toLowerCase().split(':')[0];
		return tagColors[key] || tagColors['ungrouped'];
	};
</script>

<div class="queue">
	<h3>Activity Queue</h3>
	{#if ideas.filter(i => !i.claimed_activity_id).length === 0}
		<p class="empty">No queued ideas. Use Design or add one manually.</p>
	{:else}
		{#each [...grouped()] as [tag, tagIdeas]}
			<div class="tag-group">
				<div class="tag-header" style="border-left: 3px solid {colorForTag(tag)}">
					<span class="tag-label">{tag}</span>
					<span class="tag-count">{tagIdeas.length}</span>
				</div>
				{#each tagIdeas as idea}
					<div class="idea-item">
						<button type="button" class="idea-content" onclick={() => onselect?.(idea)}>
							<span class="idea-text">{idea.content}</span>
							{#if idea.activity_type}
								<span class="idea-type">{formatType(idea.activity_type)}</span>
							{/if}
						</button>
						<button type="button" class="delete-btn" onclick={() => ondelete?.(idea)} title="Remove">x</button>
					</div>
				{/each}
			</div>
		{/each}
	{/if}
</div>

<style>
	.queue {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
		max-height: 60vh;
		overflow-y: auto;
	}

	h3 { margin: 0; }

	.empty {
		font-size: 0.8rem;
		color: #999;
	}

	.tag-group {
		display: grid;
		gap: 0.35rem;
	}

	.tag-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.2rem 0.5rem;
		font-size: 0.75rem;
		text-transform: capitalize;
	}

	.tag-label { font-weight: 600; }

	.tag-count {
		background: #f0f0ec;
		border-radius: 999px;
		padding: 0.1rem 0.4rem;
		font-size: 0.65rem;
	}

	.idea-item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.idea-content {
		flex: 1;
		border: 1px solid var(--color-border);
		background: #fdfcf8;
		border-radius: var(--radius);
		padding: 0.4rem 0.6rem;
		text-align: left;
		cursor: pointer;
		display: grid;
		gap: 0.2rem;
		font-size: 0.8rem;
	}

	.idea-content:hover {
		border-color: var(--color-primary);
		background: #f6fae8;
	}

	.idea-type {
		font-size: 0.65rem;
		text-transform: capitalize;
		color: #888;
	}

	.delete-btn {
		border: none;
		background: transparent;
		color: #ccc;
		cursor: pointer;
		font-size: 0.8rem;
		padding: 0.2rem;
	}

	.delete-btn:hover {
		color: #b42318;
	}
</style>
