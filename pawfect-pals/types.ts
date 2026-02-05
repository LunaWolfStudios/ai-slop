export enum PetType {
  CAT = 'CAT',
  DOG = 'DOG'
}

export enum Personality {
  PLAYFUL = 'Playful',
  SHY = 'Shy',
  LAZY = 'Lazy',
  MISCHIEVOUS = 'Mischievous',
  CURIOUS = 'Curious'
}

export enum PetState {
  IDLE = 'IDLE',
  SLEEPING = 'SLEEPING',
  EATING = 'EATING',
  PLAYING = 'PLAYING',
  UNHAPPY = 'UNHAPPY',
  EXCITED = 'EXCITED'
}

export interface PetConfig {
  id: string;
  type: PetType;
  name: string; // Default name (species name usually)
  personality: Personality;
  description: string;
  color: string;
}

export interface PetStats {
  happiness: number; // 0-100
  hunger: number; // 0-100 (100 is starving)
  energy: number; // 0-100
  affection: number; // 0-100
}

export interface ActivePet extends PetConfig {
  customName: string;
  stats: PetStats;
  state: PetState;
  lastInteraction: number;
  thought: string; // Current thought bubble text
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  cost: number;
  effect: {
    hunger?: number;
    happiness?: number;
    energy?: number;
    affection?: number;
  };
  type: 'FOOD' | 'TOY';
}

export interface GameState {
  coins: number;
  inventory: string[]; // List of Item IDs
  activePet: ActivePet | null;
  gameTime: number;
}
