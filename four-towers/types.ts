export enum ElementType {
  FIRE = 'FIRE',
  FROST = 'FROST',
  DARK = 'DARK',
  LIGHT = 'LIGHT',
  NEUTRAL = 'NEUTRAL'
}

export interface Point {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Entity {
  id: string;
  pos: Vector3;
  vel: Vector3;
  size: number;
  color: string;
  type: 'PLAYER' | 'ENEMY' | 'PROJECTILE' | 'PICKUP' | 'PARTICLE' | 'PORTAL';
  health: number;
  maxHealth: number;
  dead: boolean;
}

export interface Player extends Entity {
  cooldown: number;
  dashCooldown: number;
  iFrames: number;
  stats: PlayerStats;
  inventory: Polyomino[];
  equipped: (Polyomino | null)[]; // The 4x4 grid
  element: ElementType;
}

export interface Enemy extends Entity {
  aiType: 'MELEE' | 'RANGED' | 'BOSS';
  attackCooldown: number;
  range: number;
}

export interface Projectile extends Entity {
  damage: number;
  ownerId: string;
  element: ElementType;
  lifeTime: number;
}

export interface Particle extends Entity {
  lifeTime: number;
  maxLife: number;
}

export interface Polyomino {
  id: string;
  shape: boolean[][]; // 2D grid representing the shape
  color: string;
  type: ElementType;
  stats: {
    damage?: number;
    speed?: number;
    fireRate?: number;
    multishot?: number;
  };
  name: string;
}

export interface PlayerStats {
  speed: number;
  damage: number;
  fireRate: number;
  projectileSpeed: number;
  multishot: number;
}

export interface GameState {
  floor: number;
  score: number;
  isPaused: boolean;
  isGameOver: boolean;
  isInInventory: boolean;
  message: string; // For Gemini/System messages
}

export const TILE_SIZE = 32;
export const GRID_SIZE = 4; // 4x4 Staff Grid