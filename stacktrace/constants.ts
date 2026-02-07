import { CardRank, CountingSystem } from './types';

export const CARD_RANKS: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const SYSTEMS: Record<string, CountingSystem> = {
  'hilo': {
    id: 'hilo',
    name: 'Hi-Lo',
    description: 'The most popular balanced system. Good balance of ease and accuracy.',
    weights: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 0, '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
    }
  },
  'zen': {
    id: 'zen',
    name: 'Zen Count',
    description: 'An advanced multi-level balanced system for higher accuracy.',
    weights: {
      '2': 1, '3': 1, '4': 2, '5': 2, '6': 2,
      '7': 1, '8': 0, '9': 0,
      '10': -2, 'J': -2, 'Q': -2, 'K': -2, 'A': -1
    }
  },
  'halves': {
    id: 'halves',
    name: 'Wong Halves',
    description: 'A complex, high-precision system using fractional values.',
    weights: {
      '2': 0.5, '3': 1, '4': 1, '5': 1.5, '6': 1,
      '7': 0.5, '8': 0, '9': -0.5,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
    }
  }
};

export const INITIAL_DECK_COUNT = 6;
export const DEFAULT_SYSTEM = 'hilo';

// Used for composition analysis
export const FULL_DECK_COMPOSITION: Record<CardRank, number> = {
  '2': 4, '3': 4, '4': 4, '5': 4, '6': 4, '7': 4, '8': 4, '9': 4,
  '10': 4, 'J': 4, 'Q': 4, 'K': 4, 'A': 4
};
