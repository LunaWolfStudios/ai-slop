import React, { useState } from 'react';
import { GamePhase, GameState, MapId, UpgradeStats } from '../types';
import { SILK_DEFS, MAX_UPGRADE_LEVEL, UPGRADE_CONFIG } from '../constants';
import { getMapTheme } from '../utils/maps';
import { Heart, Disc, Shield, Skull, Bug, Activity, Info, Zap, ChevronDown, ChevronUp, Map as MapIcon, Pause, Play } from 'lucide-react';

interface UIOverlayProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  upgradeStats: UpgradeStats;
  setUpgradeStats: React.Dispatch<React.SetStateAction<UpgradeStats>>;
  restartGame: () => void;
  quitToMenu: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  setGameState, 
  upgradeStats, 
  setUpgradeStats,
  restartGame,
  quitToMenu
}) => {
  const [showUpgrades, setShowUpgrades] = useState(false); // Mobile toggle for upgrades

  // Upgrade Helper
  const getUpgradeCost = (stat: keyof UpgradeStats) => {
    const level = upgradeStats[stat];
    if (level >= MAX_UPGRADE_LEVEL) return Infinity;
    const config = UPGRADE_CONFIG[stat];
    return Math.floor(config.baseCost * Math.pow(config.costScale, level));
  };

  const handleUpgrade = (stat: keyof UpgradeStats) => {
    const cost = getUpgradeCost(stat);
    if (gameState.silk >= cost && upgradeStats[stat] < MAX_UPGRADE_LEVEL) {
      setGameState(prev => ({ ...prev, silk: prev.silk - cost }));
      setUpgradeStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
    }
  };

  // --- MENU SCREEN ---
  if (gameState.phase === GamePhase.MENU) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-50 px-4 overflow-y-auto">
        <div className="text-center space-y-8 animate-fade-in w-full max-w-4xl py-12">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              SILK & SWARM
            </h1>
            <p className="text-slate-400 text-lg md:text-xl tracking-widest uppercase">Protect the Nest</p>
          </div>

          {/* MAP SELECTION */}
          <div className="w-full">
            <h3 className="text-slate-400 font-bold uppercase text-sm mb-4">Select Location</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {Object.values(MapId).map((mapId) => {
                    const theme = getMapTheme(mapId);
                    const isSelected = gameState.currentMap === mapId;
                    return (
                        <button 
                            key={mapId}
                            onClick={() => setGameState(prev => ({...prev, currentMap: mapId}))}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group
                                ${isSelected ? 'border-cyan-400 bg-slate-800 scale-105 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}
                            `}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: theme.bg, border: `2px solid ${theme.anchor}` }}>
                                <MapIcon size={20} style={{ color: theme.anchor }}/>
                            </div>
                            <span className={`text-sm font-bold uppercase ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                {theme.name}
                            </span>
                        </button>
                    )
                })}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-64 mx-auto pt-4">
            <button 
              onClick={() => setGameState(prev => ({ ...prev, phase: GamePhase.TUTORIAL }))}
              className="group relative px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-sm hover:bg-cyan-400 transition-all active:scale-95 shadow-xl"
            >
              START GAME
              <div className="absolute inset-0 border-2 border-white translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform pointer-events-none" />
            </button>
          </div>
          
          <div className="text-xs text-slate-600 mt-8 leading-relaxed">
            v1.4.0 • A physics-based defense game.
          </div>
        </div>
      </div>
    );
  }

  // --- TUTORIAL OVERLAY ---
  if (gameState.phase === GamePhase.TUTORIAL) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
        <div className="bg-slate-800 border border-slate-600 p-8 rounded-2xl max-w-lg w-full shadow-2xl space-y-6 relative overflow-y-auto max-h-[90vh]">
          <div className="space-y-2">
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
               <Info className="text-cyan-400"/> How to Play
             </h2>
             <hr className="border-slate-700"/>
          </div>

          <ul className="space-y-4 text-slate-300">
            <li className="flex gap-4 items-start">
               <div className="bg-slate-700 p-2 rounded shrink-0">1</div>
               <div>
                 <strong className="text-white block">Spin Webs</strong>
                 Drag or click between the <span className="text-slate-400">grey anchor points</span> to build web strands.
               </div>
            </li>
            <li className="flex gap-4 items-start">
               <div className="bg-slate-700 p-2 rounded shrink-0">2</div>
               <div>
                 <strong className="text-white block">Trap Bugs</strong>
                 Bugs freeze and take damage when hitting webs.
               </div>
            </li>
             <li className="flex gap-4 items-start">
               <div className="bg-slate-700 p-2 rounded shrink-0">3</div>
               <div>
                 <strong className="text-white block">Adapt</strong>
                 Use different Silk types to counter armored or fast enemies.
               </div>
            </li>
          </ul>

          <button 
            onClick={() => setGameState(prev => ({ ...prev, phase: GamePhase.PLAYING }))}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
          >
            I'M READY
          </button>
        </div>
      </div>
    );
  }

  // --- GAME HUD (PLAYING & GAME_OVER) ---
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 md:p-4 z-40 overflow-hidden">
      {/* Top Bar Container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-2 pointer-events-auto w-full">
        
        {/* Stats Row */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-2 md:p-4 rounded-xl flex flex-wrap gap-2 md:gap-6 text-white shadow-xl w-full md:w-auto items-center justify-between md:justify-start">
          
          <div className="flex items-center gap-2">
            <div className="bg-slate-700 p-1.5 rounded-lg">
               <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <div className="hidden md:block text-xs text-slate-400 font-bold uppercase">Health</div>
              <div className="text-sm md:text-xl font-mono">{Math.floor(gameState.health)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-slate-700 p-1.5 rounded-lg">
               <Disc className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
            </div>
            <div>
              <div className="hidden md:block text-xs text-slate-400 font-bold uppercase">Silk</div>
              <div className="text-sm md:text-xl font-mono text-cyan-400">{Math.floor(gameState.silk)}</div>
            </div>
          </div>
          
          {/* Wave Info - Compact on Mobile */}
          <div className="flex items-center gap-2 border-l border-slate-600 pl-2 md:pl-6">
            <div className="flex flex-col items-center">
              <div className="hidden md:block text-xs text-slate-400 font-bold uppercase">Wave</div>
              <div className="text-sm md:text-xl font-mono text-amber-500">W{gameState.wave}</div>
            </div>
            
            {gameState.waveCountdown > 0 ? (
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-600 min-w-[60px] justify-center">
                    <span className="text-sm md:text-xl font-mono text-white">{gameState.waveCountdown}s</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 bg-red-900/50 px-2 py-1 rounded border border-red-800 min-w-[60px] justify-center">
                    <Bug className="w-3 h-3 text-red-400" />
                    <span className="text-sm md:text-lg font-mono text-white">{gameState.bugsRemaining}</span>
                </div>
            )}
          </div>

           <div className="flex items-center gap-2 md:ml-6">
            <div className="bg-slate-700 p-1.5 rounded-lg">
               <Activity className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
            </div>
            <div>
              <div className="hidden md:block text-xs text-slate-400 font-bold uppercase">Score</div>
              <div className="text-sm md:text-xl font-mono">{gameState.score}</div>
            </div>
          </div>
        </div>

        {/* Right Side: Pause & Upgrade */}
        <div className="flex flex-col items-end gap-2 w-full md:w-auto relative">
            <div className="flex gap-2">
                 <button 
                    onClick={() => setGameState(prev => ({...prev, isPaused: !prev.isPaused}))}
                    className="bg-slate-800 text-slate-300 p-2 rounded-lg border border-slate-600 shadow-lg hover:bg-slate-700 active:scale-95"
                >
                    {gameState.isPaused ? <Play size={16}/> : <Pause size={16}/>}
                </button>

                {/* Mobile Toggle Button */}
                <button 
                    onClick={() => setShowUpgrades(!showUpgrades)}
                    className="md:hidden bg-slate-800 text-slate-300 p-2 rounded-lg border border-slate-600 flex items-center gap-2 text-xs font-bold uppercase shadow-lg"
                >
                    {showUpgrades ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    Evolve
                </button>
            </div>

            <div className={`
                bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-xl flex flex-col gap-2 text-white shadow-xl min-w-[180px] transition-all
                ${showUpgrades ? 'block' : 'hidden md:flex'}
            `}>
                <div className="text-xs text-center font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-700 pb-1 hidden md:block">Evolve</div>
                
                <UpgradeButton 
                    label="Efficiency" 
                    icon={<Disc size={14}/>} 
                    level={upgradeStats.silkEfficiency}
                    cost={getUpgradeCost('silkEfficiency')}
                    silk={gameState.silk}
                    bgClass="bg-cyan-900"
                    description={UPGRADE_CONFIG.silkEfficiency.description}
                    onClick={() => handleUpgrade('silkEfficiency')}
                />
                 <UpgradeButton 
                    label="Web Strength" 
                    icon={<Shield size={14}/>} 
                    level={upgradeStats.webStrength}
                    cost={getUpgradeCost('webStrength')}
                    silk={gameState.silk}
                    bgClass="bg-blue-900"
                    description={UPGRADE_CONFIG.webStrength.description}
                    onClick={() => handleUpgrade('webStrength')}
                />
                 <UpgradeButton 
                    label="Venom" 
                    icon={<Skull size={14}/>} 
                    level={upgradeStats.poisonPotency}
                    cost={getUpgradeCost('poisonPotency')}
                    silk={gameState.silk}
                    bgClass="bg-green-900"
                    description={UPGRADE_CONFIG.poisonPotency.description}
                    onClick={() => handleUpgrade('poisonPotency')}
                />
                 <UpgradeButton 
                    label="Nest Regen" 
                    icon={<Zap size={14}/>} 
                    level={upgradeStats.nestRegen}
                    cost={getUpgradeCost('nestRegen')}
                    silk={gameState.silk}
                    bgClass="bg-purple-900"
                    description={UPGRADE_CONFIG.nestRegen.description}
                    onClick={() => handleUpgrade('nestRegen')}
                />
            </div>
        </div>
      </div>

      {/* PAUSE MODAL */}
      {gameState.isPaused && gameState.phase === GamePhase.PLAYING && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto z-50 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-800 border border-slate-600 p-8 rounded-2xl max-w-sm w-full shadow-2xl space-y-4 text-center">
                <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-4">Paused</h2>
                
                <button 
                  onClick={() => setGameState(prev => ({...prev, isPaused: false}))}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                >
                  RESUME
                </button>
                 <button 
                  onClick={quitToMenu}
                  className="w-full py-4 border border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white font-bold rounded-lg transition-colors"
                >
                  QUIT TO MENU
                </button>
            </div>
         </div>
      )}

      {/* GAME OVER MODAL */}
      {gameState.phase === GamePhase.GAME_OVER && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto z-50 animate-in fade-in zoom-in duration-300 p-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-red-500 mb-4 font-mono">NEST DESTROYED</h1>
            <p className="text-slate-300 text-lg md:text-xl mb-8">Score: {gameState.score} • Wave: {gameState.wave}</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button 
                onClick={restartGame}
                className="px-8 py-4 bg-white text-black font-bold rounded hover:bg-slate-200 transition-transform active:scale-95"
                >
                SPIN NEW WEB
                </button>
                 <button 
                onClick={quitToMenu}
                className="px-8 py-4 border border-white text-white font-bold rounded hover:bg-white/10 transition-transform active:scale-95"
                >
                MAIN MENU
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar - Silk Selector - Scrollable */}
      <div className="flex justify-center mb-0 md:mb-6 pointer-events-auto w-full">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-2xl flex gap-2 shadow-2xl overflow-x-auto max-w-full no-scrollbar">
          {Object.values(SILK_DEFS).map(silk => {
             const costMultiplier = Math.max(0.5, 1 - (upgradeStats.silkEfficiency * UPGRADE_CONFIG.silkEfficiency.statGain));
             const effectiveCost = Math.floor(silk.cost * costMultiplier);

             return (
            <button
              key={silk.id}
              onClick={() => setGameState(prev => ({ ...prev, selectedSilk: silk.id }))}
              className={`
                relative group flex flex-col items-center p-2 md:p-3 rounded-xl transition-all min-w-[80px] md:min-w-[96px]
                ${gameState.selectedSilk === silk.id ? 'bg-slate-700 ring-2 ring-white scale-105' : 'hover:bg-slate-800 opacity-80 hover:opacity-100'}
              `}
            >
              <div 
                className="w-6 h-6 md:w-8 md:h-8 rounded-full mb-1 md:mb-2 shadow-lg border-2 border-slate-600"
                style={{ backgroundColor: silk.color }}
              />
              <span className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-wide truncate w-full text-center">{silk.name}</span>
              <span className="text-[9px] md:text-[10px] font-mono text-cyan-400">{effectiveCost} Silk</span>
              
              {/* Tooltip */}
              <div className="hidden md:group-hover:block absolute bottom-full mb-4 w-48 bg-black border border-slate-700 p-3 rounded-lg pointer-events-none z-50">
                <p className="text-xs text-white font-bold mb-1">{silk.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{silk.description}</p>
                <div className="mt-2 flex gap-2 text-[10px]">
                   <span className="text-red-400">Dmg: {silk.damagePerSecond}</span>
                   <span className="text-blue-400">Slow: {Math.round((1 - silk.slowFactor)*100)}%</span>
                </div>
              </div>
            </button>
          );})}
        </div>
      </div>
    </div>
  );
};

// Helper Component for Upgrade Buttons
const UpgradeButton = ({ label, icon, level, cost, silk, bgClass, onClick, description }: any) => {
    const isMax = level >= MAX_UPGRADE_LEVEL;
    const canAfford = silk >= cost && !isMax;

    return (
        <button 
            onClick={onClick}
            disabled={!canAfford}
            className="group relative flex flex-col gap-1 w-full hover:bg-slate-700 p-2 rounded disabled:opacity-50 transition-colors text-left"
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-xs">
                    <div className={`p-1 ${bgClass} rounded`}>{icon}</div>
                    <span>{label}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Lvl {level}</span>
            </div>
            
            {/* Level Bar */}
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex gap-[1px]">
                {[...Array(MAX_UPGRADE_LEVEL)].map((_, i) => (
                    <div key={i} className={`flex-1 h-full ${i < level ? 'bg-cyan-500' : 'bg-slate-600'}`} />
                ))}
            </div>

            <div className="text-[10px] text-right w-full font-mono text-cyan-400">
                {isMax ? "MAX" : `${cost} Silk`}
            </div>

            {/* Hover Tooltip */}
             <div className="hidden md:group-hover:block absolute right-full mr-2 top-0 w-40 bg-black border border-slate-700 p-2 rounded-lg pointer-events-none z-50">
                <p className="text-[10px] text-slate-300 leading-tight">{description}</p>
            </div>
        </button>
    )
}