export interface BuildingDef {
  id: number;
  name: string;
  baseProd: number;
  baseCost: number;
  flavor: string;
  tier: 'prototype' | 'block1' | 'block2' | 'commercial' | 'meme';
  reqBuildingId?: number; // The building ID required to unlock this
  reqSubscribers?: number; // Minimum subscribers needed
}

export interface UpgradeDef {
  id: string;
  name: string;
  cost: number;
  currency: 'CP' | 'HYPE'; // Explicit currency type
  description: string;
  effect: (state: GameState) => number; // Returns multiplier or value
  triggerId?: number; // Building ID required to see this
  category: 'HARDWARE' | 'SOFTWARE' | 'MARKET';
  type: 'click' | 'market' | 'production' | 'hype_gen';
  flavor: string;
}

export interface GameState {
  cp: number;
  subscribers: number;
  hype: number;
  lifetimeCp: number;
  startTime: number;
  buildings: Record<number, number>; // Building ID -> Count
  upgrades: string[]; // Owned Upgrade IDs
  marketPhase: 'BULL' | 'BEAR';
  marketMultiplier: number;
  lastSaveTime: number;
}

export interface MarketHeadline {
  type: 'BULL' | 'BEAR' | 'NEUTRAL';
  text: string;
}