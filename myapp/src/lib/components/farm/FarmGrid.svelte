<script lang="ts">
	import type { Activity } from '$lib/types';
	import ActivityTile from '$lib/components/farm/ActivityTile.svelte';
	import { invalidate } from '$app/navigation';

	interface Props {
		rows: number;
		cols: number;
		activities: Activity[];
		plotId?: string;
		onactivityclick?: (activity: Activity) => void;
		oncellclick?: (row: number, col: number) => void;
		onactivitymoved?: () => void;
	}

	let { rows, cols, activities, plotId, onactivityclick, oncellclick, onactivitymoved }: Props = $props();

	const key = (row: number, col: number) => `${row},${col}`;

	const activityByCell = $derived(() => {
		const map = new Map<string, Activity>();
		for (const activity of activities) {
			for (const [r, c] of activity.grid_positions ?? []) {
				map.set(key(r, c), activity);
			}
		}
		return map;
	});

	const anchorByActivity = $derived(() => {
		const map = new Map<string, string>();
		for (const activity of activities) {
			const positions = activity.grid_positions ?? [];
			if (!positions.length) continue;
			const sorted = [...positions].sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
			const [r, c] = sorted[0];
			map.set(activity.id, key(r, c));
		}
		return map;
	});

	const safeRows = $derived(() => {
		const value = Number(rows ?? 0);
		return Number.isFinite(value) ? Math.max(0, value) : 0;
	});
	const safeCols = $derived(() => {
		const value = Number(cols ?? 0);
		return Number.isFinite(value) ? Math.max(0, value) : 0;
	});

	const rowsArray = $derived(() => Array.from({ length: safeRows() }, (_, index) => index));
	const colsArray = $derived(() => Array.from({ length: safeCols() }, (_, index) => index));

	// Drag state
	let dragActivity = $state<Activity | null>(null);
	let dragSourceAnchor = $state<[number, number] | null>(null);
	let dragOverCell = $state<[number, number] | null>(null);

	const projectedCells = $derived(() => {
		if (!dragActivity || !dragSourceAnchor || !dragOverCell) return new Set<string>();
		const [srcRow, srcCol] = dragSourceAnchor;
		const [tgtRow, tgtCol] = dragOverCell;
		const rowOffset = tgtRow - srcRow;
		const colOffset = tgtCol - srcCol;
		return new Set(
			(dragActivity.grid_positions ?? []).map(([r, c]) => key(r + rowOffset, c + colOffset))
		);
	});

	const isValidDrop = $derived(() => {
		if (!dragActivity || !dragSourceAnchor || !dragOverCell) return false;
		const [srcRow, srcCol] = dragSourceAnchor;
		const [tgtRow, tgtCol] = dragOverCell;
		const rowOffset = tgtRow - srcRow;
		const colOffset = tgtCol - srcCol;
		if (rowOffset === 0 && colOffset === 0) return false;
		const newPositions: [number, number][] = (dragActivity.grid_positions ?? []).map(([r, c]) => [r + rowOffset, c + colOffset]);
		if (newPositions.some(([r, c]) => r < 0 || c < 0 || r >= safeRows() || c >= safeCols())) return false;
		const occupiedByOthers = new Set<string>();
		for (const act of activities) {
			if (act.id === dragActivity.id) continue;
			for (const [r, c] of act.grid_positions ?? []) occupiedByOthers.add(key(r, c));
		}
		return !newPositions.some(([r, c]) => occupiedByOthers.has(key(r, c)));
	});

	function handleDragStart(activity: Activity, e: DragEvent) {
		dragActivity = activity;
		const sorted = [...(activity.grid_positions ?? [])].sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
		dragSourceAnchor = sorted[0] ?? null;
		e.dataTransfer!.effectAllowed = 'move';
	}

	function handleDragEnd() {
		dragActivity = null;
		dragSourceAnchor = null;
		dragOverCell = null;
	}

	function handleDragOver(row: number, col: number, e: DragEvent) {
		if (!dragActivity) return;
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
		dragOverCell = [row, col];
	}

	async function handleDrop(row: number, col: number, e: DragEvent) {
		e.preventDefault();
		dragOverCell = null;

		if (!dragActivity || !dragSourceAnchor || !plotId) {
			dragActivity = null;
			dragSourceAnchor = null;
			return;
		}

		const [srcRow, srcCol] = dragSourceAnchor;
		const rowOffset = row - srcRow;
		const colOffset = col - srcCol;

		if (rowOffset === 0 && colOffset === 0) {
			dragActivity = null;
			dragSourceAnchor = null;
			return;
		}

		const newPositions: [number, number][] = (dragActivity.grid_positions ?? []).map(
			([r, c]) => [r + rowOffset, c + colOffset]
		);

		if (newPositions.some(([r, c]) => r < 0 || c < 0 || r >= safeRows() || c >= safeCols())) {
			dragActivity = null;
			dragSourceAnchor = null;
			return;
		}

		const occupiedByOthers = new Set<string>();
		for (const act of activities) {
			if (act.id === dragActivity.id) continue;
			for (const [r, c] of act.grid_positions ?? []) occupiedByOthers.add(key(r, c));
		}
		if (newPositions.some(([r, c]) => occupiedByOthers.has(key(r, c)))) {
			dragActivity = null;
			dragSourceAnchor = null;
			return;
		}

		const moved = dragActivity;
		dragActivity = null;
		dragSourceAnchor = null;

		await fetch(`/api/activities/${moved.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ grid_positions: newPositions })
		});

		if (plotId) await invalidate(`app:plot:${plotId}`);
		onactivitymoved?.();
	}

	const handleCellClick = (row: number, col: number) => {
		if (dragActivity) return;
		const activity = activityByCell().get(key(row, col));
		if (activity) {
			onactivityclick?.(activity);
			return;
		}
		oncellclick?.(row, col);
	};

</script>

<div class="farm-grid">
	{#if safeRows() === 0 || safeCols() === 0}
		<p class="empty">No grid configured.</p>
	{:else}
		<div class="grid" style={`grid-template-columns: repeat(${safeCols()}, minmax(120px, 1fr));`}>
			{#each rowsArray() as r}
				{#each colsArray() as c}
					{#key `${r}-${c}`}
						{@const cellKey = key(r, c)}
						{@const activity = activityByCell().get(cellKey)}
						{@const isAnchor = activity && anchorByActivity().get(activity.id) === cellKey}
						{@const isDragging = dragActivity && (dragActivity.grid_positions ?? []).some(([dr, dc]) => dr === r && dc === c)}
						{@const isProjected = projectedCells().has(cellKey)}
						<div
							class="cell"
							class:drag-over={isProjected && isValidDrop()}
							class:drag-invalid={isProjected && !isValidDrop()}
							class:is-dragging={isDragging}
							on:click={() => handleCellClick(r, c)}
							on:dragover={(e) => handleDragOver(r, c, e)}
							on:drop={(e) => handleDrop(r, c, e)}
						>
							{#if activity}
								{#if isAnchor}
									<div
										draggable={true}
										class="draggable-wrapper"
										on:dragstart={(e) => handleDragStart(activity, e)}
										on:dragend={handleDragEnd}
									>
										<ActivityTile
											{activity}
											{plotId}
											ripeness={(activity as any)?.stats?.ripeness ?? 0}
											onclick={() => onactivityclick?.(activity)}
										/>
									</div>
								{:else}
									<div class="merged"></div>
								{/if}
							{:else}
								<div class="empty-cell">+</div>
							{/if}
						</div>
					{/key}
				{/each}
			{/each}
		</div>
	{/if}
</div>

<style>
	.farm-grid {
		width: 100%;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
	}

	.grid {
		display: grid;
		gap: 0.75rem;
	}

	.cell {
		min-height: 110px;
		display: flex;
		align-items: stretch;
		justify-content: stretch;
		cursor: pointer;
		border-radius: var(--radius);
		transition: background 0.1s ease, outline 0.1s ease;
	}

	.cell.drag-over {
		outline: 2px solid var(--color-primary);
		outline-offset: -2px;
		background: color-mix(in srgb, var(--color-primary) 8%, transparent);
	}

	.cell.drag-invalid {
		outline: 2px solid #e05050;
		outline-offset: -2px;
		background: color-mix(in srgb, #e05050 8%, transparent);
	}

	.cell.is-dragging {
		opacity: 0.35;
	}

	.draggable-wrapper {
		width: 100%;
		cursor: grab;
	}

	.draggable-wrapper:active {
		cursor: grabbing;
	}

	.empty-cell {
		width: 100%;
		height: 100%;
		border: 2px dashed #d8d8d0;
		border-radius: var(--radius);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		color: #b4b4aa;
		transition: border-color 0.15s ease, color 0.15s ease;
	}

	.cell:hover .empty-cell {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.merged {
		width: 100%;
		height: 100%;
		border-radius: var(--radius);
		background: #f3f3ef;
		border: 1px dashed #e3e3dc;
	}

	.empty {
		color: #666;
	}
</style>
