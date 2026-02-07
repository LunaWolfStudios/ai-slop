import { CardEvent, AppSettings, ComputedState, CardRank } from '../types';
import { SYSTEMS, FULL_DECK_COMPOSITION, CARD_RANKS } from '../constants';

export const computeGameState = (history: CardEvent[], settings: AppSettings): ComputedState => {
  const system = SYSTEMS[settings.systemId];
  const totalCardsInShoe = settings.decks * 52;
  
  // Initialize composition with full shoe
  const composition: Record<CardRank, number> = {} as Record<CardRank, number>;
  CARD_RANKS.forEach(rank => {
    composition[rank] = FULL_DECK_COMPOSITION[rank] * settings.decks;
  });

  let runningCount = 0;
  const historyPoints = [];

  // Replay history
  for (const event of history) {
    // Update RC
    runningCount += system.weights[event.rank];
    
    // Update Composition
    if (composition[event.rank] > 0) {
      composition[event.rank] -= 1;
    }

    // Capture point for graph (simplified: only capture occasional points or all if small)
    // For performance on large sets, we might throttle, but for <1000 cards, all is fine.
    // We calculate "instant" TC for the graph
    const cardsSeenSoFar = history.indexOf(event) + 1;
    const decksRem = Math.max(0.5, (totalCardsInShoe - cardsSeenSoFar) / 52); // Avoid div by zero, clamp to 0.5 decks min
    const tc = runningCount / decksRem;

    historyPoints.push({
      time: new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rc: runningCount,
      tc: parseFloat(tc.toFixed(2))
    });
  }

  const cardsSeen = history.length;
  const cardsRemaining = totalCardsInShoe - cardsSeen;
  const decksRemaining = Math.max(0.1, cardsRemaining / 52); // Clamp to avoid infinity
  
  const trueCount = runningCount / decksRemaining;

  // Approximate Advantage: TC * 0.5% - House Edge (approx 0.5%)
  // This is a rough heuristic. We'll use just TC * 0.5% as "Player Deviation Advantage" for simplicity
  // or the standard deviation: (TC - 1) * 0.5% ?? 
  // Standard rule of thumb: ~0.5% advantage per TC unit above 1.
  // We'll stick to a simple scaler for visualization: TC * 0.5%.
  const advantage = trueCount * 0.5;

  return {
    runningCount: parseFloat(runningCount.toFixed(1)), // Handle .5 float issues
    trueCount: parseFloat(trueCount.toFixed(2)),
    cardsSeen,
    decksRemaining: parseFloat(decksRemaining.toFixed(2)),
    advantage: parseFloat(advantage.toFixed(2)),
    historyPoints,
    composition
  };
};
