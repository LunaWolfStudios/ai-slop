import React, { useState, useEffect, useRef } from 'react';
import StockTicker from './components/StockTicker';
import OrbitSystem from './components/OrbitSystem';
import EndGameModal from './components/EndGameModal';
import CartoonEarth from './components/CartoonEarth';
import TechTree from './components/TechTree';
import ResourceHeader from './components/ResourceHeader';
import { BUILDINGS, UPGRADES } from './constants';
import { GameState, BuildingDef } from './types';

// Initial State
const INITIAL_STATE: GameState = {
  cp: 0,
  subscribers: 0,
  hype: 0,
  lifetimeCp: 0,
  startTime: Date.now(),
  buildings: {},
  upgrades: [],
  marketPhase: 'BULL',
  marketMultiplier: 1.25,
  lastSaveTime: Date.now(),
};

export default function App() {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [showEndGame, setShowEndGame] = useState(false);
  const [manualClickEffect, setManualClickEffect] = useState<{id: number, x: number, y: number, val: string}[]>([]);
  
  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('spacemob_save_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(prev => ({ ...prev, ...parsed, subscribers: parsed.subscribers || 0, hype: parsed.hype || 0 }));
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('spacemob_save_v4', JSON.stringify(gameState));
    }, 5000); 
    return () => clearInterval(timer);
  }, [gameState]);

  // --- MARKET CYCLE ---
  useEffect(() => {
    const marketTimer = setInterval(() => {
      setGameState(prev => {
        const isBull = Math.random() > 0.45;
        const hasDiamondHands = prev.upgrades.includes('diamond_hands');
        const hasShortSqueeze = prev.upgrades.includes('short_squeeze');
        
        let multiplier = 1.0;
        if (isBull) {
           let baseBull = 1.25 + Math.random() * 0.75;
           if (hasShortSqueeze) baseBull *= 1.2;
           multiplier = baseBull;
        } else {
           let penalty = 0.5 + Math.random() * 0.4;
           if (hasDiamondHands) {
             // Less penalty (e.g., 0.5 becomes 0.75)
             penalty = penalty + ((1 - penalty) * 0.5); 
           }
           multiplier = penalty;
        }

        return {
          ...prev,
          marketPhase: isBull ? 'BULL' : 'BEAR',
          marketMultiplier: multiplier
        };
      });
    }, 30000);

    return () => clearInterval(marketTimer);
  }, []);

  // --- GAME LOOP (Tick) ---
  useEffect(() => {
    const tickRate = 100; // 100ms
    const loop = setInterval(() => {
      setGameState(prev => {
        // 1. Calculate CP Generation
        let cps = 0;
        BUILDINGS.forEach(b => {
          const count = prev.buildings[b.id] || 0;
          let prod = b.baseProd;
          
          // Folding hinge boosts prototype satellites (ID 0-5)
          if (b.tier === 'prototype' && prev.upgrades.includes('folding_hinge')) {
             prod *= 1.2;
          }

          cps += count * prod;
        });

        // Apply Global Multipliers
        let productionMult = 1;
        if (prev.upgrades.includes('midland_factory')) productionMult *= 1.2;
        if (prev.upgrades.includes('goldman_coverage')) productionMult *= 1.5;
        if (prev.upgrades.includes('beamforming')) productionMult *= 2.0;
        if (prev.upgrades.includes('qv_band')) productionMult *= 1.5;
        if (prev.upgrades.includes('carbon_fiber')) productionMult *= 1.1;
        if (prev.upgrades.includes('ai_traffic')) productionMult *= 1.3;

        const effectiveCps = cps * productionMult * prev.marketMultiplier;
        const cpGain = effectiveCps / (1000 / tickRate);

        // 2. Subscriber Generation
        let subGain = 0;
        let subMult = 1;
        if (prev.upgrades.includes('5g_integration')) subMult *= 2;

        Object.entries(prev.buildings).forEach(([idStr, count]) => {
           const id = parseInt(idStr);
           const countNum = count as number;
           if (id >= 3 && countNum > 0) {
              subGain += (countNum * (id - 2) * 0.5); 
           }
        });
        const subTick = (subGain * subMult) / (1000 / tickRate);

        return {
          ...prev,
          cp: prev.cp + cpGain,
          lifetimeCp: prev.lifetimeCp + cpGain,
          subscribers: prev.subscribers + subTick
        };
      });
    }, tickRate);

    return () => clearInterval(loop);
  }, []);

  // --- HELPERS ---
  const getBuildingCost = (b: BuildingDef, currentCount: number) => {
    return Math.floor(b.baseCost * Math.pow(1.15, currentCount));
  };

  const getClickPower = () => {
    let power = 1;
    const totalBuildings = (Object.values(gameState.buildings) as number[]).reduce((a: number, b: number) => a + b, 0);
    power += (totalBuildings * 0.1);

    if (gameState.upgrades.includes('asic_chips')) power *= 3;
    if (gameState.upgrades.includes('mimo_tech')) power *= 5;
    if (gameState.upgrades.includes('meme_warfare')) power *= 1.5;
    
    power *= gameState.marketMultiplier;
    return Math.max(1, power);
  };

  const getHypePerClick = () => {
    let hype = 1; // Base
    if (gameState.upgrades.includes('retail_energy')) hype += 2;
    return hype;
  };

  const handleBuyBuilding = (b: BuildingDef) => {
    const count = gameState.buildings[b.id] || 0;
    const cost = getBuildingCost(b, count);
    
    if (gameState.cp >= cost) {
      setGameState(prev => ({
        ...prev,
        cp: prev.cp - cost,
        buildings: {
          ...prev.buildings,
          [b.id]: count + 1
        }
      }));

      if (b.id === 15 && count === 0) { 
        setShowEndGame(true);
      }
    }
  };

  const handleBuyUpgrade = (uId: string, cost: number, currency: 'CP' | 'HYPE') => {
    const currentAmount = currency === 'HYPE' ? gameState.hype : gameState.cp;
    
    if (currentAmount >= cost && !gameState.upgrades.includes(uId)) {
      setGameState(prev => ({
        ...prev,
        [currency === 'HYPE' ? 'hype' : 'cp']: currentAmount - cost,
        upgrades: [...prev.upgrades, uId]
      }));
    }
  };

  const handleEarthClick = (e: React.MouseEvent) => {
    const cpPower = getClickPower();
    const hypePower = getHypePerClick();

    setGameState(prev => ({
      ...prev,
      cp: prev.cp + cpPower,
      lifetimeCp: prev.lifetimeCp + cpPower,
      hype: prev.hype + hypePower
    }));

    // Visual Effect
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Slight randomization of popup position
    const randX = x + 20 + (Math.random() * 40 - 20);
    const randY = y - 20 + (Math.random() * 40 - 20);

    const newEffect = { id: Date.now(), x: randX, y: randY, val: `+${formatNumber(cpPower)} CP / +${hypePower} H` };
    setManualClickEffect(prev => [...prev, newEffect]);
    
    setTimeout(() => {
      setManualClickEffect(prev => prev.filter(eff => eff.id !== newEffect.id));
    }, 800);
  };

  const calculateTotalCPS = () => {
    let cps = 0;
    BUILDINGS.forEach(b => {
      const count = gameState.buildings[b.id] || 0;
      let prod = b.baseProd;
      if (b.tier === 'prototype' && gameState.upgrades.includes('folding_hinge')) {
         prod *= 1.2;
      }
      cps += count * prod;
    });
    
    let productionMult = 1;
    if (gameState.upgrades.includes('midland_factory')) productionMult *= 1.2;
    if (gameState.upgrades.includes('goldman_coverage')) productionMult *= 1.5;
    if (gameState.upgrades.includes('beamforming')) productionMult *= 2.0;
    if (gameState.upgrades.includes('qv_band')) productionMult *= 1.5;
    if (gameState.upgrades.includes('carbon_fiber')) productionMult *= 1.1;
    if (gameState.upgrades.includes('ai_traffic')) productionMult *= 1.3;

    return cps * productionMult * gameState.marketMultiplier;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return Math.floor(num).toLocaleString();
  };

  // --- RENDER ---
  return (
    <div className="h-screen w-screen flex flex-col text-white bg-transparent overflow-hidden relative selection:bg-purple-500/30">
      
      {/* Background Stars - Static Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 150 }).map((_, i) => (
          <div 
            key={i} 
            className="star" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() < 0.2 ? 3 : (Math.random() < 0.5 ? 2 : 1)}px`,
              height: `${Math.random() < 0.2 ? 3 : (Math.random() < 0.5 ? 2 : 1)}px`,
              opacity: Math.random() * 0.6 + 0.2
            }}
          />
        ))}
      </div>

      {/* Top Resource Bar */}
      <ResourceHeader 
        cp={gameState.cp} 
        subscribers={gameState.subscribers} 
        hype={gameState.hype} 
        cps={calculateTotalCPS()} 
      />

      {/* Ticker Below Header */}
      <StockTicker marketPhase={gameState.marketPhase} multiplier={gameState.marketMultiplier} />

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: EARTH & VISUALS */}
        <div className="flex-1 relative flex flex-col items-center justify-center">
           
           {/* Orbit System Layer */}
           <OrbitSystem buildings={gameState.buildings} />

           {/* Animated Earth */}
           <div className="relative">
              <CartoonEarth onClick={handleEarthClick} />
              
              {/* Click Value Popups */}
              {manualClickEffect.map(eff => (
                <div 
                  key={eff.id}
                  className="absolute text-lg font-bold text-green-400 pointer-events-none select-none animate-float-up z-50 whitespace-nowrap shadow-black drop-shadow-md"
                  style={{ left: eff.x, top: eff.y }} 
                >
                  {eff.val}
                </div>
              ))}
           </div>
        </div>

        {/* RIGHT PANEL: TECH TREE */}
        <TechTree 
          buildings={BUILDINGS}
          upgrades={UPGRADES}
          ownedBuildings={gameState.buildings}
          ownedUpgrades={gameState.upgrades}
          currentCp={gameState.cp}
          currentHype={gameState.hype}
          currentSubscribers={gameState.subscribers}
          onBuyBuilding={handleBuyBuilding}
          onBuyUpgrade={handleBuyUpgrade}
        />
      </div>

      {showEndGame && (
        <EndGameModal 
          onContinue={() => setShowEndGame(false)} 
          onPrestige={() => alert("Prestige feature coming in DLC! (Reload page to reset manually for now)")} 
        />
      )}
      
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-80px); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}