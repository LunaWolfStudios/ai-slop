import { Coordinate, CellType } from '../types';

// Directions: Up, Right, Down, Left
const DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

export const isValidPos = (pos: Coordinate, size: number) => {
  return pos.x >= 0 && pos.x < size && pos.y >= 0 && pos.y < size;
};

export const findPath = (
  grid: CellType[][],
  start: Coordinate,
  end: Coordinate,
  size: number
): Coordinate[] | null => {
  const queue: Coordinate[] = [start];
  const cameFrom = new Map<string, Coordinate | null>();
  const startKey = `${start.x},${start.y}`;
  
  cameFrom.set(startKey, null);

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Check if reached end
    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path: Coordinate[] = [];
      let curr: Coordinate | null = current;
      while (curr) {
        path.unshift(curr);
        const key = `${curr.x},${curr.y}`;
        curr = cameFrom.get(key) || null;
      }
      return path;
    }

    // Explore neighbors
    for (const dir of DIRECTIONS) {
      const next: Coordinate = { x: current.x + dir.x, y: current.y + dir.y };
      const nextKey = `${next.x},${next.y}`;

      if (
        isValidPos(next, size) &&
        !cameFrom.has(nextKey) &&
        grid[next.y][next.x] !== CellType.WALL &&
        grid[next.y][next.x] !== CellType.OBSTACLE
      ) {
        queue.push(next);
        cameFrom.set(nextKey, current);
      }
    }
  }

  return null; // No path found
};

export const generateGrid = (
  size: number,
  obstacleCount: number,
  start: Coordinate,
  end: Coordinate
): CellType[][] => {
  // Initialize empty grid
  let grid: CellType[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(CellType.EMPTY));

  // Set Start and End
  grid[start.y][start.x] = CellType.START;
  grid[end.y][end.x] = CellType.END;

  // Place Random Obstacles
  let placed = 0;
  while (placed < obstacleCount) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);

    // Don't place on start, end, or existing obstacles
    if (grid[y][x] === CellType.EMPTY) {
      // Temporarily place
      grid[y][x] = CellType.OBSTACLE;
      
      // Ensure path still exists
      if (findPath(grid, start, end, size)) {
        placed++;
      } else {
        // Revert if it blocks path
        grid[y][x] = CellType.EMPTY;
      }
    }
  }

  return grid;
};
