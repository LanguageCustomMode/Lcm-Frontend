<script lang="ts">
	import FarmGrid from '$lib/components/farm/FarmGrid.svelte';
	import Toolbar from '$lib/components/farm/Toolbar.svelte';
	import ActivityQueue from '$lib/components/farm/ActivityQueue.svelte';
	import { apiGet, apiPost, apiDelete } from '$lib/api';
	import type { ActivityType, Idea, PlotDetail } from '$lib/types';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let selectedType = $state<ActivityType | null>(null);
	let mode = $state<'create' | 'extend' | 'quick'>('create');
	let ideas = $state<Idea[]>([]);
	let loadingIdeas = $state(false);

	const loadIdeas = async () => {
		if (!data.plot) return;
		loadingIdeas = true;
		try {
			ideas = await apiGet<Idea[]>(`/plots/${data.plot.id}/ideas`);
		} catch { /* ignore */ }
		loadingIdeas = false;
	};

	$effect(() => {
		if (data.plot) loadIdeas();
	});

	const handleSelect = (type: ActivityType) => {
		selectedType = type;
	};

	const handleCellClick = (row: number, col: number) => {
		if (!data.plot || !selectedType) return;
		const params = new URLSearchParams({ activity_type: selectedType, row: String(row), col: String(col) });
		goto(`/dashboard/plots/${data.plot.id}/design?${params.toString()}`);
	};

	const handleActivityClick = (activity: PlotDetail['activities'][number]) => {
		if (mode === 'extend' && selectedType) {
			const params = new URLSearchParams({ target_type: selectedType });
			goto(`/dashboard/plots/${data.plot?.id}/activities/${activity.id}/extend?${params.toString()}`);
			return;
		}
		goto(`/dashboard/plots/${data.plot?.id}/activities/${activity.id}`);
	};

	const handleQuickCreate = async (type: ActivityType, idea: string) => {
		if (!data.plot) return;
		try {
			await apiPost(`/plots/${data.plot.id}/activities`, {
				name: idea,
				type,
				config: {},
			});
			// Reload the plot to get updated activities
			const plot = await apiGet<PlotDetail>(`/plots/${data.plot.id}`);
			data.plot = plot;
		} catch (e: any) {
			console.error('Quick create failed:', e);
		}
	};

	const handleIdeaSelect = async (idea: Idea) => {
		if (!data.plot) return;
		try {
			// Create activity from queue idea
			const activity = await apiPost<{ id: string }>(`/plots/${data.plot.id}/activities`, {
				name: idea.content,
				type: idea.activity_type || 'vocabulary',
				config: {},
			});
			// Mark idea as claimed
			await apiPost(`/llm/generate/${activity.id}?source_idea_id=${idea.id}`, {
				source_idea_id: idea.id,
			}).catch(() => {});
			// Reload
			const plot = await apiGet<PlotDetail>(`/plots/${data.plot.id}`);
			data.plot = plot;
			await loadIdeas();
		} catch (e: any) {
			console.error('Create from idea failed:', e);
		}
	};

	const handleIdeaDelete = async (idea: Idea) => {
		if (!data.plot) return;
		try {
			await apiDelete(`/plots/${data.plot.id}/ideas/${idea.id}`);
			ideas = ideas.filter(i => i.id !== idea.id);
		} catch { /* ignore */ }
	};
</script>

<h1>{data.plot?.name ?? 'Plot'}</h1>
<div class="plot-layout">
	<div class="main-area">
		<Toolbar
			onselect={handleSelect}
			{mode}
			onmodechange={(value) => (mode = value)}
			onquickcreate={handleQuickCreate}
		/>
		{#if data.plot}
			<FarmGrid
				rows={data.plot.grid_rows}
				cols={data.plot.grid_cols}
				activities={data.plot.activities ?? []}
				oncellclick={handleCellClick}
				onactivityclick={handleActivityClick}
			/>
		{/if}
	</div>
	<aside class="queue-sidebar">
		<ActivityQueue
			{ideas}
			onselect={handleIdeaSelect}
			ondelete={handleIdeaDelete}
		/>
	</aside>
</div>

<style>
	.plot-layout {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 1rem;
		align-items: start;
	}

	.main-area {
		display: grid;
		gap: 1rem;
	}

	@media (max-width: 900px) {
		.plot-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
