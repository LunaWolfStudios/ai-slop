export enum ModuleType {
  INTRO = 'INTRO',
  PHYSICS = 'PHYSICS',
  COMPARISON = 'COMPARISON',
  DASHBOARD = 'DASHBOARD',
  EXPLORER = 'EXPLORER',
}

export enum ScenarioType {
  HIGHWAY = 'HIGHWAY',
  STADIUM = 'STADIUM',
  CONCERT = 'CONCERT',
  RAIL = 'RAIL',
  INDUSTRIAL = 'INDUSTRIAL',
  AIRPORT = 'AIRPORT',
  CONSTRUCTION = 'CONSTRUCTION',
}

export interface ScenarioData {
  id: ScenarioType;
  label: string;
  color: string;
  sourceDb: number;
  description: string;
  icon: string;
  frequencyLabel: string;
  problem: string;
  solution: string;
}

export interface SimulationState {
  barrierType: 'NONE' | 'TRADITIONAL' | 'SOUNDSHIELD';
  height: number; // in meters
  distance: number; // in meters
}
