import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { GameState, SilkType, UpgradeStats, GamePhase, MapId } from './types';
import { WAVE_COUNTDOWN_SECONDS } from './constants';

const INITIAL_STATE: GameState = {
  phase: GamePhase.MENU,
  currentMap: MapId.DEFAULT,
  silk: 150,
  health: 100,
  maxHealth: 100,
  wave: 1,
  score: 0,
  isPaused: false,
  selectedSilk: SilkType.STANDARD,
  waveCountdown: WAVE_COUNTDOWN_SECONDS,
  bugsRemaining: 0,
};

const INITIAL_UPGRADES: UpgradeStats = {
  silkEfficiency: 0,
  webStrength: 0,
  poisonPotency: 0,
  nestRegen: 0,
};

function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [upgradeStats, setUpgradeStats] = useState<UpgradeStats>(INITIAL_UPGRADES);

  const restartGame = () => {
    setGameState({
      ...INITIAL_STATE,
      currentMap: gameState.currentMap, // Preserve selected map
      phase: GamePhase.PLAYING,
      selectedSilk: gameState.selectedSilk,
      waveCountdown: WAVE_COUNTDOWN_SECONDS, // Start with timer
      bugsRemaining: 0,
    });
    setUpgradeStats(INITIAL_UPGRADES);
  };

  const quitToMenu = () => {
    setGameState(INITIAL_STATE);
    setUpgradeStats(INITIAL_UPGRADES);
  };

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden font-sans select-none">
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState} 
        upgradeStats={upgradeStats}
      />
      <UIOverlay 
        gameState={gameState} 
        setGameState={setGameState} 
        upgradeStats={upgradeStats}
        setUpgradeStats={setUpgradeStats}
        restartGame={restartGame}
        quitToMenu={quitToMenu}
      />
      
      <div className="absolute top-4 left-4 pointer-events-none opacity-30 text-white text-[10px] z-0">
        v1.4.0 • Silk & Swarm
      </div>
    </div>
  );
}

export default App;