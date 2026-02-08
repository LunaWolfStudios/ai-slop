export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface CountingSystem {
  id: string;
  name: string;
  weights: Record<CardRank, number>;
  description?: string;
}

export interface CardEvent {
  id: string;
  rank: CardRank;
  timestamp: number;
  inputLabel?: string; // Optional label for when using Simple Mode
}

export interface ComputedState {
  runningCount: number;
  trueCount: number;
  cardsSeen: number;
  decksRemaining: number;
  penetration: number;
  advantage: number;
  historyPoints: {
    time: string;
    rc: number;
    tc: number;
  }[];
  composition: Record<CardRank, number>; // How many of each rank remain
}

export interface AppSettings {
  decks: number;
  systemId: string;
  inputMode: 'detailed' | 'simple';
}