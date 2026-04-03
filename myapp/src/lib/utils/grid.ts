/**
 * Grid layout logic and contiguity validation for the farm grid.
 */

export type GridPosition = [row: number, col: number];

export function isContiguous(positions: GridPosition[]): boolean {
	// TODO: Contiguity = all positions connected by 4-neighbor adjacency.
	// Outline:
	// - If 0/1 positions, return true.
	// - Normalize positions into a Set of "r,c" strings for O(1) lookup.
	// - BFS/DFS from the first position, visiting neighbors in [up, down, left, right].
	// - Count visited cells; contiguous if visited count === positions.length.
	throw new Error('Not implemented');
}

export function getAvailableCells(
	gridRows: number,
	gridCols: number,
	occupiedPositions: GridPosition[]
): GridPosition[] {
	// TODO: Return all cells not present in occupiedPositions.
	// Outline:
	// - Create a Set of occupied "r,c" strings.
	// - Iterate r=0..gridRows-1, c=0..gridCols-1 and include free cells.
	// - Optionally keep deterministic row-major ordering for stable UI.
	throw new Error('Not implemented');
}

export function positionsToKey(positions: GridPosition[]): string {
	return positions.map(([r, c]) => `${r},${c}`).sort().join('|');
}
