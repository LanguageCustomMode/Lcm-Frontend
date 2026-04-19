<script lang="ts">
	import type { Activity } from '$lib/types';
	import ActivityTile from '$lib/components/farm/ActivityTile.svelte';

	interface Props {
		rows: number;
		cols: number;
		activities: Activity[];
		onactivityclick?: (activity: Activity) => void;
		oncellclick?: (row: number, col: number) => void;
	}

	let { rows, cols, activities, onactivityclick, oncellclick }: Props = $props();

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

	const handleCellClick = (row: number, col: number) => {
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
						<div class="cell" on:click={() => handleCellClick(r, c)}>
							{#if activityByCell().get(key(r, c))}
								{#if anchorByActivity().get(activityByCell().get(key(r, c))!.id) === key(r, c)}
									<ActivityTile
										activity={activityByCell().get(key(r, c))!}
										ripeness={(activityByCell().get(key(r, c)) as any)?.stats?.ripeness ?? 0}
										onclick={() => onactivityclick?.(activityByCell().get(key(r, c))!)}
									/>
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
