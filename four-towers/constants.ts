import { ElementType, Polyomino } from './types';

export const COLORS = {
  [ElementType.FIRE]: '#fb7185', // lighter red/pink for better visibility on dark bg
  [ElementType.FROST]: '#22d3ee',
  [ElementType.DARK]: '#a78bfa',
  [ElementType.LIGHT]: '#facc15',
  [ElementType.NEUTRAL]: '#e5e7eb',
  BG: '#09090b',
  WALL: '#18181b', // Zinc-950
  FLOOR: '#27272a', // Zinc-800
  FLOOR_HIGHLIGHT: '#3f3f46',
  UI_BG: 'rgba(9, 9, 11, 0.95)'
};

// Isometric Projection Constants
export const ISO_ANGLE = 0.5; // Simple isometric factor

export const STARTING_POLYOMINOS: Polyomino[] = [
  {
    id: 'base_shard',
    name: 'Arcane Shard',
    type: ElementType.NEUTRAL,
    color: COLORS[ElementType.NEUTRAL],
    shape: [[true]],
    stats: { damage: 5, speed: 1 }
  },
  {
    id: 'fire_bar',
    name: 'Ignis Bar',
    type: ElementType.FIRE,
    color: COLORS[ElementType.FIRE],
    shape: [[true, true]],
    stats: { damage: 10, fireRate: 0.8 } // Slower fire, more dmg
  },
  {
    id: 'frost_l',
    name: 'Cryo Angle',
    type: ElementType.FROST,
    color: COLORS[ElementType.FROST],
    shape: [[true, false], [true, true]],
    stats: { fireRate: 1.2, speed: 2 }
  }
];

export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 30;
