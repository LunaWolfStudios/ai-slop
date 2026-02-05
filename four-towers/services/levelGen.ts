import { MAP_WIDTH, MAP_HEIGHT } from '../constants';

export enum TileType {
  VOID = 0,
  FLOOR = 1,
  WALL = 2,
  SPAWN = 3,
  EXIT = 4
}

export const generateLevel = (floor: number): TileType[][] => {
  let map: TileType[][] = Array(MAP_HEIGHT).fill(0).map(() => Array(MAP_WIDTH).fill(TileType.VOID));

  // 1. Random Noise
  for (let y = 1; y < MAP_HEIGHT - 1; y++) {
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      if (Math.random() > 0.45) {
        map[y][x] = TileType.FLOOR;
      }
    }
  }

  // 2. Cellular Automata Smoothing
  const iterations = 4;
  for (let i = 0; i < iterations; i++) {
    const newMap = map.map(row => [...row]);
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
      for (let x = 1; x < MAP_WIDTH - 1; x++) {
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (map[y + dy][x + dx] !== TileType.VOID) neighbors++;
          }
        }
        if (neighbors > 4) newMap[y][x] = TileType.FLOOR;
        else if (neighbors < 4) newMap[y][x] = TileType.VOID;
      }
    }
    map = newMap;
  }

  // 2.5 ENSURE CONNECTIVITY (Flood Fill)
  // Find all distinct regions of floor tiles
  const getRegion = (startX: number, startY: number, visited: Set<string>) => {
    const region: {x: number, y: number}[] = [];
    const stack = [{x: startX, y: startY}];
    visited.add(`${startX},${startY}`);
    region.push({x: startX, y: startY});

    while (stack.length > 0) {
      const {x, y} = stack.pop()!;
      const neighbors = [
        {x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1}
      ];

      for (const n of neighbors) {
        if (n.x >= 1 && n.x < MAP_WIDTH - 1 && n.y >= 1 && n.y < MAP_HEIGHT - 1) {
          const key = `${n.x},${n.y}`;
          if (map[n.y][n.x] === TileType.FLOOR && !visited.has(key)) {
            visited.add(key);
            region.push(n);
            stack.push(n);
          }
        }
      }
    }
    return region;
  };

  const regions: {x: number, y: number}[][] = [];
  const visited = new Set<string>();

  for (let y = 1; y < MAP_HEIGHT - 1; y++) {
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      if (map[y][x] === TileType.FLOOR && !visited.has(`${x},${y}`)) {
        regions.push(getRegion(x, y, visited));
      }
    }
  }

  // If no regions found (extremely rare), retry
  if (regions.length === 0) return generateLevel(floor);

  // Sort by size (largest first)
  regions.sort((a, b) => b.length - a.length);
  const mainRegion = regions[0];

  // If main region is too small, retry
  if (mainRegion.length < 20) return generateLevel(floor);

  // Remove all other regions (fill with VOID)
  for (let i = 1; i < regions.length; i++) {
    for (const tile of regions[i]) {
      map[tile.y][tile.x] = TileType.VOID;
    }
  }

  // 3. Find spawn and exit (furthest points) using ONLY the mainRegion
  let floorTiles = mainRegion;

  const spawn = floorTiles[Math.floor(Math.random() * floorTiles.length)];
  map[spawn.y][spawn.x] = TileType.SPAWN;

  // Find furthest tile for exit
  let maxDist = 0;
  let exit = spawn;
  
  floorTiles.forEach(tile => {
    const dist = Math.hypot(tile.x - spawn.x, tile.y - spawn.y);
    if (dist > maxDist) {
      maxDist = dist;
      exit = tile;
    }
  });
  
  map[exit.y][exit.x] = TileType.EXIT;

  // 4. Add Walls around floors
  // We iterate again to place walls around the now-guaranteed connected floor
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (map[y][x] === TileType.VOID) {
        // Check if any neighbor is floor/spawn/exit
        let touchesFloor = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (y + dy >= 0 && y + dy < MAP_HEIGHT && x + dx >= 0 && x + dx < MAP_WIDTH) {
               const neighbor = map[y+dy][x+dx];
               if (neighbor === TileType.FLOOR || neighbor === TileType.SPAWN || neighbor === TileType.EXIT) {
                 touchesFloor = true;
               }
            }
          }
        }
        if (touchesFloor) map[y][x] = TileType.WALL;
      }
    }
  }

  return map;
};