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
<!--
Stub outline:
- Build a 2D grid of cells (rows x cols).
- Map activity.grid_positions -> occupied cells.
- Render ActivityTile in the first cell of each activity; mark merged cells.
- oncellclick(row, col) for empty cells to start design flow.
- onactivityclick(activity) to open detail.
- DnD: allow dragging tiles, validate contiguity using utils/grid.ts,
  then emit a "grid save" event to PATCH /plots/{plotId}/grid.
-->
<div class="farm-grid">
	<p>Farm Grid ({rows}x{cols}) — {activities.length} activities</p>
</div>
