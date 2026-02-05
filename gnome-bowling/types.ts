export interface Pin {
  id: number;
  row: number;
  col: number;
  offset: number;
  x: number; // Render position percentage (0-100)
  y: number; // Render position percentage (0-100)
  isDown: boolean;
  angle: number; // Fall angle
}

export interface BallState {
  x: number; // Horizontal position percentage (0-100)
  y: number; // Vertical position percentage (0-100)
  rotation: number;
}

export enum GamePhase {
  AIMING = 'AIMING',
  POWER = 'POWER',
  ROLLING = 'ROLLING',
  SCORING = 'SCORING',
  GAME_OVER = 'GAME_OVER'
}

export interface ScoreFrame {
  rolls: number[];
  score: number;
  cumulativeScore: number;
  isStrike: boolean;
  isSpare: boolean;
}

export type CommentaryType = 'STRIKE' | 'SPARE' | 'GUTTER' | 'MISS' | 'GAME_START' | 'GAME_OVER';