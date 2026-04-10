<script lang="ts">
	import type { ActivityType } from '$lib/types';

	interface Props {
		onselect?: (type: ActivityType) => void;
		mode?: 'create' | 'extend' | 'quick';
		onmodechange?: (mode: 'create' | 'extend' | 'quick') => void;
		onquickcreate?: (type: ActivityType, idea: string) => void;
	}

	let { onselect, mode = 'create', onmodechange, onquickcreate }: Props = $props();
	const activityTypes: ActivityType[] = [
		'vocabulary',
		'grammar_theory',
		'grammar_processing',
		'cultural_knowledge',
		'template_sentences',
		'grammar_manipulations',
		'fundamentals',
		'reading',
		'dialogue',
		'writing_practice',
		'pronunciation',
		'listening',
		'errors_srs',
		'generic_conversation'
	];

	let selected: ActivityType | null = $state(null);
	let quickIdea = $state('');

	const formatLabel = (value: string) => value.replace(/_/g, ' ');
	const handleSelect = (type: ActivityType) => {
		selected = selected === type ? null : type;
		if (selected) onselect?.(selected);
	};

	const handleMode = (value: 'create' | 'extend' | 'quick') => {
		onmodechange?.(value);
	};

	const handleQuickCreate = () => {
		if (!selected || !quickIdea.trim()) return;
		onquickcreate?.(selected, quickIdea.trim());
		quickIdea = '';
	};
</script>

<div class="toolbar">
	<div class="toolbar-header">
		<h3>Activity Tools</h3>
		<div class="mode-toggle">
			<button
				type="button"
				class:active={mode === 'create'}
				onclick={() => handleMode('create')}
			>
				Create
			</button>
			<button
				type="button"
				class:active={mode === 'extend'}
				onclick={() => handleMode('extend')}
			>
				Extend
			</button>
			<button
				type="button"
				class:active={mode === 'quick'}
				onclick={() => handleMode('quick')}
			>
				Quick Add
			</button>
		</div>
	</div>
	<div class="tool-grid">
		{#each activityTypes as type}
			<button
				type="button"
				class:selected={selected === type}
				onclick={() => handleSelect(type)}
				title={`Create ${formatLabel(type)}`}
			>
				{formatLabel(type)}
			</button>
		{/each}
	</div>
	{#if selected && mode === 'quick'}
		<div class="quick-create">
			<input
				bind:value={quickIdea}
				placeholder="Type an idea for this activity..."
				onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickCreate(); }}}
			/>
			<button type="button" onclick={handleQuickCreate} disabled={!quickIdea.trim()}>Add to Grid</button>
		</div>
	{:else if selected}
		<p class="hint">
			{mode === 'create'
				? 'Click an empty cell to place this activity.'
				: 'Click an activity to extend with this type.'}
		</p>
	{/if}
</div>

<style>
	.toolbar {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
	}

	.toolbar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.mode-toggle {
		display: flex;
		gap: 0.35rem;
	}

	.mode-toggle button {
		border: 1px solid var(--color-border);
		background: #f6f6f2;
		border-radius: 999px;
		padding: 0.2rem 0.6rem;
		font-size: 0.7rem;
		cursor: pointer;
	}

	.mode-toggle button.active {
		background: var(--color-primary);
		color: white;
		border-color: transparent;
	}

	.tool-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.5rem;
	}

	.tool-grid button {
		border: 1px solid var(--color-border);
		background: #fff;
		border-radius: var(--radius);
		padding: 0.4rem 0.5rem;
		font-size: 0.75rem;
		text-transform: capitalize;
		cursor: pointer;
	}

	.tool-grid button.selected {
		background: var(--color-primary);
		color: white;
		border-color: transparent;
	}

	.hint {
		font-size: 0.75rem;
		color: #555;
	}

	.quick-create {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.quick-create input {
		flex: 1;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.4rem 0.6rem;
		font-size: 0.8rem;
	}

	.quick-create button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.35rem 0.8rem;
		font-size: 0.75rem;
		cursor: pointer;
		white-space: nowrap;
	}

	.quick-create button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
