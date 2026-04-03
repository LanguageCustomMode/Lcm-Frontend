<script lang="ts">
	import FarmGrid from '$lib/components/farm/FarmGrid.svelte';
	import Toolbar from '$lib/components/farm/Toolbar.svelte';

	let { data } = $props();
</script>

<!-- TODO: Main farm grid view -->
<!--
Stub outline:
- Track selected activity tool from Toolbar.
- On empty cell click, route to design with preselected type.
- On activity click, route to activity detail.
- Persist grid rearrangements via PATCH /plots/{plot_id}/grid.
-->
<h1>{data.plot?.name ?? 'Plot'}</h1>
<Toolbar />
{#if data.plot}
	<FarmGrid
		rows={data.plot.grid_rows}
		cols={data.plot.grid_cols}
		activities={data.plot.activities ?? []}
	/>
{/if}
