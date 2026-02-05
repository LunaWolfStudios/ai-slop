export type Coordinate = {
  x: number;
  y: number;
};

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  OBSTACLE = 2,
  START = 3,
  END = 4,
}

export enum GamePhase {
  MENU = 'MENU',
  BUILD = 'BUILD',
  RUN = 'RUN',
  RESULT = 'RESULT',
}

export interface GameConfig {
  gridSize: number;
  buildTimeSeconds: number;
  initialResources: number;
  obstacleCount: number;
}
