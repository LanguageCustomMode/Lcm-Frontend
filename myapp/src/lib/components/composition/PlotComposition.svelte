<script lang="ts">
	import type { PlotComposition } from '$lib/types';

	interface Props {
		composition: PlotComposition;
	}

	let { composition }: Props = $props();
</script>

<!-- TODO: Tier/modality distribution charts -->
<!--
Stub outline:
- Render simple bar lists for by_tier and by_modality.
- Show total_cards and due_cards summary.
- Keep minimal styling; no chart library required initially.
-->
<div class="plot-composition">
	<p>Total cards: {composition.total_cards}</p>
	<p>Due cards: {composition.due_cards}</p>
</div>
