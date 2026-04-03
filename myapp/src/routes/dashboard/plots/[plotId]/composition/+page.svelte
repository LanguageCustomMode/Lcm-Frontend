<script lang="ts">
	import PlotComposition from '$lib/components/composition/PlotComposition.svelte';

	let { data } = $props();
</script>

<!-- TODO: Load composition data from API -->
<h1>Plot Composition</h1>
<PlotComposition composition={{ by_tier: {}, by_modality: {}, total_cards: 0, due_cards: 0 }} />
