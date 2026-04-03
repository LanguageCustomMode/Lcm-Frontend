<script lang="ts">
	import FarmGrid from '$lib/components/farm/FarmGrid.svelte';
	import Toolbar from '$lib/components/farm/Toolbar.svelte';

	let { data } = $props();
</script>

<!-- TODO: Main farm grid view -->
<h1>{data.plot?.name ?? 'Plot'}</h1>
<Toolbar />
{#if data.plot}
	<FarmGrid
		rows={data.plot.grid_rows}
		cols={data.plot.grid_cols}
		activities={data.plot.activities ?? []}
	/>
{/if}
