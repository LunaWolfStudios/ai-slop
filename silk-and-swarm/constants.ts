import { SilkType, SilkConfig, BugType } from './types';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;
export const NEST_RADIUS = 40;
export const WAVE_COUNTDOWN_SECONDS = 12;
export const PASSIVE_SILK_PER_SECOND = 2; // Auto-generate silk

export const SILK_DEFS: Record<SilkType, SilkConfig> = {
  [SilkType.STANDARD]: {
    id: SilkType.STANDARD,
    name: "Standard Silk",
    cost: 5,
    color: "#e2e8f0", // slate-200
    width: 2,
    description: "Basic structural silk. Cheap and reliable.",
    durability: 30,
    damagePerSecond: 0,
    slowFactor: 0.8,
  },
  [SilkType.STICKY]: {
    id: SilkType.STICKY,
    name: "Sticky Silk",
    cost: 12,
    color: "#fbbf24", // amber-400
    width: 3,
    description: "High friction. Greatly slows bugs.",
    durability: 20,
    damagePerSecond: 0,
    slowFactor: 0.2,
  },
  [SilkType.POISON]: {
    id: SilkType.POISON,
    name: "Venom Silk",
    cost: 20,
    color: "#a3e635", // lime-400
    width: 2,
    description: "Injects toxins that damage bugs over time.",
    durability: 15,
    damagePerSecond: 0.8,
    slowFactor: 0.9,
  },
  [SilkType.STEEL]: {
    id: SilkType.STEEL,
    name: "Steel Silk",
    cost: 25,
    color: "#94a3b8", // slate-400
    width: 4,
    description: "Reinforced durability. Blocks armored bugs.",
    durability: 100,
    damagePerSecond: 0,
    slowFactor: 0.95,
  },
  [SilkType.ELECTRIC]: {
    id: SilkType.ELECTRIC,
    name: "Shock Silk",
    cost: 40,
    color: "#22d3ee", // cyan-400
    width: 2,
    description: "Zaps enemies on contact.",
    durability: 10,
    damagePerSecond: 2.5,
    slowFactor: 0.6,
  },
};

export const BUG_STATS: Record<BugType, { speed: number; health: number; radius: number; damage: number; value: number; color: string }> = {
  [BugType.ANT]: {
    speed: 1.5,
    health: 10,
    radius: 8,
    damage: 5,
    value: 3,
    color: "#f87171", // red-400
  },
  [BugType.BEETLE]: {
    speed: 0.8,
    health: 30,
    radius: 12,
    damage: 15,
    value: 8,
    color: "#60a5fa", // blue-400
  },
  [BugType.WASP]: {
    speed: 3.0,
    health: 5,
    radius: 6,
    damage: 8,
    value: 5,
    color: "#fbbf24", // amber-400
  },
  [BugType.BOSS]: {
    speed: 0.5,
    health: 300,
    radius: 25,
    damage: 50,
    value: 100,
    color: "#c084fc", // purple-500
  },
};

// Upgrade Configuration
export const MAX_UPGRADE_LEVEL = 10;
export const UPGRADE_CONFIG = {
  silkEfficiency: {
    baseCost: 50,
    costScale: 1.4, // Cost multiplies by 1.4 each level
    statGain: 0.05, // 5% cheaper per level (Max 50%)
    description: "Reduces silk cost by 5% per level"
  },
  webStrength: {
    baseCost: 50,
    costScale: 1.5,
    statGain: 0.2, // 20% more HP per level (Max 200% bonus)
    description: "Increases web durability by 20% per level"
  },
  poisonPotency: {
    baseCost: 60,
    costScale: 1.5,
    statGain: 0.2, // 20% more damage per level
    description: "Increases silk damage by 20% per level"
  },
  nestRegen: {
    baseCost: 100,
    costScale: 1.6,
    statGain: 1, // +1 HP per wave/tick
    description: "Repairs Nest +1 HP after each wave"
  }
};