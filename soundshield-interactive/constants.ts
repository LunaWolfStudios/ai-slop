import { ScenarioType, ScenarioData } from './types';
import { Car, Trophy, Music, Train, Factory, Plane, Hammer } from 'lucide-react';

export const SCENARIOS: Record<ScenarioType, ScenarioData> = {
  [ScenarioType.HIGHWAY]: {
    id: ScenarioType.HIGHWAY,
    label: 'Highway Traffic',
    color: '#3b82f6', // Blue
    sourceDb: 85,
    description: 'Continuous high-speed rolling noise.',
    icon: 'Car',
    frequencyLabel: 'Broadband',
    problem: 'Traffic noise bleeding into residential zones.',
    solution: 'Transparent upper panels preserve sightlines while cutting dB.',
  },
  [ScenarioType.STADIUM]: {
    id: ScenarioType.STADIUM,
    label: 'Stadium Arena',
    color: '#22c55e', // Green
    sourceDb: 95,
    description: 'Dynamic crowd roar and PA systems.',
    icon: 'Trophy',
    frequencyLabel: 'Mid-High',
    problem: 'Game-day peaks exceed local noise ordinances.',
    solution: 'Curved absorptive rings direct roar skyward.',
  },
  [ScenarioType.CONCERT]: {
    id: ScenarioType.CONCERT,
    label: 'Outdoor Concert',
    color: '#a855f7', // Purple
    sourceDb: 105,
    description: 'High amplitude amplified music.',
    icon: 'Music',
    frequencyLabel: 'Full Spectrum',
    problem: 'Bass leakage causes community complaints.',
    solution: 'Tuned perimeter barriers for specific frequency bands.',
  },
  [ScenarioType.RAIL]: {
    id: ScenarioType.RAIL,
    label: 'Freight Rail',
    color: '#06b6d4', // Cyan
    sourceDb: 100,
    description: 'Low frequency wheel-track interaction.',
    icon: 'Train',
    frequencyLabel: 'Low Frequency',
    problem: 'Heavy vibration and low rumble.',
    solution: 'Thicker composite core with damping layers.',
  },
  [ScenarioType.INDUSTRIAL]: {
    id: ScenarioType.INDUSTRIAL,
    label: 'Industrial Plant',
    color: '#f97316', // Orange
    sourceDb: 88,
    description: 'Continuous machinery and fan drone.',
    icon: 'Factory',
    frequencyLabel: 'Tonal',
    problem: '24/7 regulatory limit violations.',
    solution: 'Chemical-resistant skins enclosing machinery.',
  },
  [ScenarioType.AIRPORT]: {
    id: ScenarioType.AIRPORT,
    label: 'Airport Ops',
    color: '#64748b', // Slate
    sourceDb: 110,
    description: 'Jet engines and ground operations.',
    icon: 'Plane',
    frequencyLabel: 'High Pitch',
    problem: 'Ground ops noise affecting neighbors.',
    solution: 'Tall modular arrays near aprons.',
  },
  [ScenarioType.CONSTRUCTION]: {
    id: ScenarioType.CONSTRUCTION,
    label: 'Construction',
    color: '#eab308', // Yellow
    sourceDb: 92,
    description: 'Impact noise and heavy equipment.',
    icon: 'Hammer',
    frequencyLabel: 'Impulsive',
    problem: 'Short-term distinct noise peaks.',
    solution: 'Rapid deployment rental panels.',
  },
};

export const COST_DATA = [
  { name: 'Year 1', traditional: 100, soundshield: 80, savings: 20 },
  { name: 'Year 3', traditional: 150, soundshield: 90, savings: 60 },
  { name: 'Year 5', traditional: 220, soundshield: 100, savings: 120 },
  { name: 'Year 10', traditional: 400, soundshield: 120, savings: 280 },
];
