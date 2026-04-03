<script lang="ts">
	import type { PlotComposition } from '$lib/types';

	interface Props {
		composition: PlotComposition;
	}

	let { composition }: Props = $props();
</script>

<!-- TODO: Tier/modality distribution charts -->
<div class="plot-composition">
	<p>Total cards: {composition.total_cards}</p>
	<p>Due cards: {composition.due_cards}</p>
</div>
