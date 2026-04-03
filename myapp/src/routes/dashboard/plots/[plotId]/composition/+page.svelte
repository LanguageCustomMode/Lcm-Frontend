<script lang="ts">
	import PlotComposition from '$lib/components/composition/PlotComposition.svelte';

	let { data } = $props();
</script>

<!-- TODO: Load composition data from API -->
<!--
Stub outline:
- GET /plots/{plot_id}/composition -> { by_tier, by_modality, total_cards, due_cards }.
- Pass to PlotComposition and render simple summaries.
-->
<h1>Plot Composition</h1>
<PlotComposition composition={{ by_tier: {}, by_modality: {}, total_cards: 0, due_cards: 0 }} />
