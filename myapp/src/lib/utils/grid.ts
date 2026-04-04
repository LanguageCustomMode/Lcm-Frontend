/**
 * Grid layout logic and contiguity validation for the farm grid.
 */

export type GridPosition = [row: number, col: number];

export function isContiguous(positions: GridPosition[]): boolean {
	if (positions.length <= 1) return true;
	const key = (r: number, c: number) => `${r},${c}`;
	const positionSet = new Set(positions.map(([r, c]) => key(r, c)));
	const [start] = positions;
	if (!start) return true;
	const queue: GridPosition[] = [start];
	const visited = new Set<string>([key(start[0], start[1])]);

	while (queue.length > 0) {
		const [r, c] = queue.shift()!;
		const neighbors: GridPosition[] = [
			[r - 1, c],
			[r + 1, c],
			[r, c - 1],
			[r, c + 1]
		];
		for (const [nr, nc] of neighbors) {
			const k = key(nr, nc);
			if (!positionSet.has(k) || visited.has(k)) continue;
			visited.add(k);
			queue.push([nr, nc]);
		}
	}

	return visited.size === positions.length;
}

export function getAvailableCells(
	gridRows: number,
	gridCols: number,
	occupiedPositions: GridPosition[]
): GridPosition[] {
	const key = (r: number, c: number) => `${r},${c}`;
	const occupied = new Set(occupiedPositions.map(([r, c]) => key(r, c)));
	const available: GridPosition[] = [];
	for (let r = 0; r < gridRows; r += 1) {
		for (let c = 0; c < gridCols; c += 1) {
			if (!occupied.has(key(r, c))) available.push([r, c]);
		}
	}
	return available;
}

export function positionsToKey(positions: GridPosition[]): string {
	return positions.map(([r, c]) => `${r},${c}`).sort().join('|');
}
