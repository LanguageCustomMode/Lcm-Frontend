<script lang="ts">
	import FarmGrid from '$lib/components/farm/FarmGrid.svelte';
	import PlotDoc from '$lib/components/plot/PlotDoc.svelte';
	import DesignChat from '$lib/components/plot/DesignChat.svelte';
	import QuickCreatePanel from '$lib/components/plot/QuickCreatePanel.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { PlotDetail } from '$lib/types';
	import { goto, invalidateAll } from '$app/navigation';

	let { data } = $props();

	let plotDocRef = $state<PlotDoc | null>(null);
	let quickCreateOpen = $state(false);
	let quickCreateRow = $state(0);
	let quickCreateCol = $state(0);

	const handleCellClick = (row: number, col: number) => {
		if (!data.plot) return;
		quickCreateRow = row;
		quickCreateCol = col;
		quickCreateOpen = true;
	};

	const handleActivityClick = (activity: PlotDetail['activities'][number]) => {
		goto(`/dashboard/plots/${data.plot?.id}/activities/${activity.id}`);
	};

	const handlePlotDocUpdate = (markdown: string) => {
		plotDocRef?.applyRemoteUpdate(markdown);
	};

	const handleWishlistAdd = () => {
		/* No-op: QuickCreatePanel reloads when opened. */
	};

	const handleQuickCreated = async () => {
		quickCreateOpen = false;
		await invalidateAll();
	};

	const handleActivityMoved = async () => {
		await invalidateAll();
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

{#if data.plot}
	<Modal bind:open={quickCreateOpen} title="Add activity">
		{#if quickCreateOpen}
			<QuickCreatePanel
				plotId={data.plot.id}
				row={quickCreateRow}
				col={quickCreateCol}
				onclose={() => (quickCreateOpen = false)}
				oncreated={handleQuickCreated}
			/>
		{/if}
	</Modal>

	<div class="farmgrid-wrap">
		<FarmGrid
			rows={data.plot.grid_rows}
			cols={data.plot.grid_cols}
			activities={data.plot.activities ?? []}
			plotId={data.plot.id}
			oncellclick={handleCellClick}
			onactivityclick={handleActivityClick}
			onactivitymoved={handleActivityMoved}
		/>
	</div>

	<div class="top-split-wrap">
		<div class="top-split">
			<PlotDoc bind:this={plotDocRef} plotId={data.plot.id} />
			<DesignChat
				plotId={data.plot.id}
				onplotdocupdate={handlePlotDocUpdate}
				onwishlistadd={handleWishlistAdd}
			/>
		</div>
	</div>
{/if}

<style>
	.plot-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 0.5rem;
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
	.top-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.farmgrid-wrap {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
	.top-split-wrap {
		margin-bottom: 1rem;
	}
	@media (max-width: 900px) {
		.top-split {
			grid-template-columns: 1fr;
		}
	}
</style>
