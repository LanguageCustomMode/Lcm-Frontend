/**
 * Grid layout logic and contiguity validation for the farm grid.
 */

export type GridPosition = [row: number, col: number];

export function isContiguous(positions: GridPosition[]): boolean {
	throw new Error('Not implemented');
}

export function getAvailableCells(
	gridRows: number,
	gridCols: number,
	occupiedPositions: GridPosition[]
): GridPosition[] {
	throw new Error('Not implemented');
}

export function positionsToKey(positions: GridPosition[]): string {
	return positions.map(([r, c]) => `${r},${c}`).sort().join('|');
}
