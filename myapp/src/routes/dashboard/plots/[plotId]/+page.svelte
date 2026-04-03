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

<h1>{data.plot?.name ?? 'Plot'}</h1>
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
