<script lang="ts">
	import type { Activity } from '$lib/types';

	interface Props {
		rows: number;
		cols: number;
		activities: Activity[];
		onactivityclick?: (activity: Activity) => void;
		oncellclick?: (row: number, col: number) => void;
	}

	let { rows, cols, activities, onactivityclick, oncellclick }: Props = $props();
</script>

<!-- TODO: Implement drag-and-drop grid with SvelteDnD -->
<div class="farm-grid">
	<p>Farm Grid ({rows}x{cols}) — {activities.length} activities</p>
</div>
