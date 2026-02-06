export interface Point {
  x: number;
  y: number;
}

export enum SilkType {
  STANDARD = 'STANDARD',
  STICKY = 'STICKY',
  POISON = 'POISON',
  STEEL = 'STEEL',
  ELECTRIC = 'ELECTRIC',
}

export interface SilkConfig {
  id: SilkType;
  name: string;
  cost: number;
  color: string;
  width: number;
  description: string;
  durability: number;
  damagePerSecond: number;
  slowFactor: number; // 0.1 = very slow, 1.0 = normal
}

export interface Anchor {
  id: string;
  pos: Point;
  radius: number;
}

export interface WebStrand {
  id: string;
  p1: Point;
  p2: Point;
  type: SilkType;
  currentDurability: number;
  maxDurability: number;
  vibration: number; // For visual effect when hit
}

export enum BugType {
  ANT = 'ANT',
  BEETLE = 'BEETLE',
  WASP = 'WASP',
  BOSS = 'BOSS',
}

export interface Bug {
  id: string;
  type: BugType;
  pos: Point;
  velocity: Point;
  speed: number;
  health: number;
  maxHealth: number;
  radius: number;
  slowedTimer: number; // Frames remaining for slow effect
  poisonTimer: number; // Frames remaining for poison tick
  damage: number; // Damage dealt to web/player
  value: number; // Silk reward
}

export interface Particle {
  id: string;
  pos: Point;
  velocity: Point;
  life: number; // Frames
  maxLife: number;
  color: string;
  size: number;
}

export interface FloatingText {
  id: string;
  text: string;
  pos: Point;
  life: number;
  color: string;
}

// Stores the LEVEL of the upgrade (0 to 10)
export interface UpgradeStats {
  silkEfficiency: number; 
  webStrength: number; 
  poisonPotency: number; 
  nestRegen: number; 
}

export enum GamePhase {
  MENU = 'MENU',
  TUTORIAL = 'TUTORIAL',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export enum MapId {
  DEFAULT = 'DEFAULT',
  CITY = 'CITY',
  FOREST = 'FOREST',
  GARDEN = 'GARDEN',
}

export interface GameState {
  phase: GamePhase;
  currentMap: MapId;
  silk: number;
  health: number;
  maxHealth: number;
  wave: number;
  score: number;
  isPaused: boolean;
  selectedSilk: SilkType;
  // Wave state
  waveCountdown: number; // Seconds until next wave
  bugsRemaining: number;
}