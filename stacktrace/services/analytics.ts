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
  for (let i = 0; i < history.length; i++) {
    const event = history[i];
    // Update RC
    runningCount += system.weights[event.rank];
    
    // Update Composition
    if (composition[event.rank] > 0) {
      composition[event.rank] -= 1;
    }

    const cardsSeenSoFar = i + 1;
    // Use high precision for graph history too, clamp to 0.01 decks (approx half a card) to avoid infinity
    const decksRem = Math.max(0.01, (totalCardsInShoe - cardsSeenSoFar) / 52);
    const tc = runningCount / decksRem;

    historyPoints.push({
      time: new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rc: runningCount,
      tc: parseFloat(tc.toFixed(2))
    });
  }

  const cardsSeen = history.length;
  const cardsRemaining = totalCardsInShoe - cardsSeen;
  
  // High precision decks remaining.
  // 1 card is ~0.019 decks. We clamp at 0.001 to prevent division by zero while maintaining accuracy for even the last card.
  const decksRemaining = Math.max(0.001, cardsRemaining / 52);
  
  const trueCount = runningCount / decksRemaining;

  // Approximate Advantage: TC * 0.5%
  const advantage = trueCount * 0.5;

  const penetration = totalCardsInShoe > 0 ? (cardsSeen / totalCardsInShoe) * 100 : 0;

  return {
    runningCount: parseFloat(runningCount.toFixed(1)), // Handle .5 float issues
    trueCount: parseFloat(trueCount.toFixed(2)),
    cardsSeen,
    decksRemaining: parseFloat(decksRemaining.toFixed(3)), // 3 decimals for high accuracy
    penetration: parseFloat(penetration.toFixed(1)),
    advantage: parseFloat(advantage.toFixed(2)),
    historyPoints,
    composition
  };
};