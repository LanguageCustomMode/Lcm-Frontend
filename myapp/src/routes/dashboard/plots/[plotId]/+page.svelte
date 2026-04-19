<script lang="ts">
	import FarmGrid from '$lib/components/farm/FarmGrid.svelte';
	import Toolbar from '$lib/components/farm/Toolbar.svelte';
	import type { ActivityType, PlotDetail } from '$lib/types';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let selectedType = $state<ActivityType | null>(null);
	let mode = $state<'create' | 'extend'>('create');

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
</script>

<div class="plot-header">
	<div>
		<h1>{data.plot?.name ?? 'Plot'}</h1>
		{#if data.plot?.description}
			<p class="plot-desc">{data.plot.description}</p>
		{/if}
	</div>
	{#if data.plot}
		<nav class="plot-nav">
			<a href="/dashboard/plots/{data.plot.id}/composition">Stats</a>
			<a href="/dashboard/plots/{data.plot.id}/references">References</a>
			<a href="/dashboard/plots/{data.plot.id}/settings">Settings</a>
		</nav>
	{/if}
</div>

<Toolbar onselect={handleSelect} {mode} onmodechange={(value) => (mode = value)} />
{#if data.plot}
	<FarmGrid
		rows={data.plot.grid_rows}
		cols={data.plot.grid_cols}
		activities={data.plot.activities ?? []}
		oncellclick={handleCellClick}
		onactivityclick={handleActivityClick}
	/>
{/if}

<style>
	.plot-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 0.25rem;
	}

	.plot-desc {
		font-size: 0.8rem;
		color: #666;
		margin-top: 0.25rem;
	}

	.plot-nav {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.plot-nav a {
		font-size: 0.8rem;
		color: #555;
		text-decoration: none;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		padding: 0.3rem 0.75rem;
		background: white;
		transition: border-color 0.15s, color 0.15s;
	}

	.plot-nav a:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}
</style>
