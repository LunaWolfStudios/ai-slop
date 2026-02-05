
export type LocationType = 'neighborhood' | 'nature';

export interface Location {
  id: string;
  name: string;
  description: string;
  type: LocationType;
  baseDistance: number;
  unlocked: boolean;
  discoveredSpots: string[];
}

export interface Snack {
  id: string;
  name: string;
  description: string;
  type: 'treat' | 'gift' | 'unauthorized';
  foundAt: string;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  locationName: string;
  content: string;
  clankBehavior?: string;
}

export interface GameState {
  currentLocation: Location | null;
  progress: number; // 0 to 100
  visitedLocations: string[];
  snacks: Snack[];
  journal: JournalEntry[];
  clankMood: 'excited' | 'chill' | 'sniffing' | 'tired' | 'barking';
  isWalking: boolean;
  isDriving: boolean;
  stamina: number;
}

export enum GameView {
  MENU = 'MENU',
  MAP = 'MAP',
  WALK = 'WALK',
  JOURNAL = 'JOURNAL',
  DRIVE = 'DRIVE'
}
