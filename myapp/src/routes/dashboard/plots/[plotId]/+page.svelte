<script lang="ts">
	import FarmGrid from '$lib/components/farm/FarmGrid.svelte';
	import PlotDoc from '$lib/components/plot/PlotDoc.svelte';
	import DesignChat from '$lib/components/plot/DesignChat.svelte';
	import QuickCreatePanel from '$lib/components/plot/QuickCreatePanel.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { PlotDetail } from '$lib/types';
	import { goto, invalidate } from '$app/navigation';

	let { data } = $props();

	let plotDocRef = $state<PlotDoc | null>(null);
	let quickCreateOpen = $state(false);
	let quickCreateRow = $state(0);
	let quickCreateCol = $state(0);

	// Calculate max activities based on player level
	// Level 1-4: 6 activities
	// Level 5-9: 11 activities
	// Level 10-14: 16 activities, etc.
	const maxActivities = $derived(() => {
		const level = data.gamification?.level ?? 1;
		return 6 + 5 * Math.floor(level / 5);
	});

	const handleCellClick = (row: number, col: number) => {
		if (!data.plot) return;
		if (!canCreateActivity()) return;
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
		if (data.plot?.id) await invalidate(`app:plot:${data.plot.id}`);
	};

	const handleActivityMoved = async () => {
		if (data.plot?.id) await invalidate(`app:plot:${data.plot.id}`);
	};

	// Check if user can create more activities
	const canCreateActivity = $derived(() => {
		const activityCount = data.plot?.activities?.length ?? 0;
		return activityCount < maxActivities();
	});
</script>

<div class="plot-header">
	<div>
		<h1>{data.plot?.name ?? 'Plot'}</h1>
		{#if data.plot?.description}
			<p class="plot-desc">{data.plot.description}</p>
		{/if}
	</div>
</div>

{#key data.plot?.id}
	{#if data.plot}
		<Modal bind:open={quickCreateOpen} title="Add activity">
			{#if quickCreateOpen}
				<QuickCreatePanel
					plotId={data.plot.id}
					row={quickCreateRow}
					col={quickCreateCol}
					maxActivitySlots={maxActivities()}
					activityCount={data.plot.activities?.length ?? 0}
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
				userLevel={data.gamification?.level ?? 1}
				maxActivitySlots={maxActivities()}
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
{/key}

<style>
	.plot-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}
	.plot-header h1 {
		font-family: 'Nunito', 'Trebuchet MS', 'Segoe UI', sans-serif;
		font-weight: 700;
	}
	.plot-desc {
		font-size: 0.8rem;
		color: #666;
		margin-top: 0.25rem;
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
