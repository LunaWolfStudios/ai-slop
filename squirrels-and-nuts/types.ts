export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type EntityType = 'Squirrel' | 'Nut' | 'Berry' | 'Fruit' | 'Seed' | 'Insect' | 'Vegetation' | 'Fungi' | 'Bush' | 'Plant' | 'Tree' | 'Toxic' | 'Predator' | 'Farm' | 'Shelter' | 'Defense';

export interface GameEntity {
  name: string;
  type: EntityType;
  tier: number;
  description?: string;
  cost?: Record<string, number>;
  production?: Record<string, number>;
  capIncrease?: number; // For shelters
  defense?: number; // For toxic plants
}

export interface GameState {
  resources: Record<string, number>; // Name -> Amount
  inventory: Record<string, number>; // EntityName -> Count
  unlocked: string[]; // List of entity names unlocked
  season: Season;
  day: number;
  timeOfDay: number; // 0-100 representing day progress
  logs: LogEntry[];
  seasonTimer: number;
  clickPower: number;
  maxSquirrels: number;
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  timestamp: number;
}

export const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
export const SEASON_DURATION = 120; // Seconds per season
export const DAY_DURATION = 10; // Seconds per day
