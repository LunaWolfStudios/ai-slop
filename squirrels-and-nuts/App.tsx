import React, { useState, useEffect, useReducer, useRef } from 'react';
import { GameState, LogEntry, Season, SEASONS, SEASON_DURATION, GameEntity } from './types';
import { 
  RAW_DATA, SQUIRREL_DATA, BUSH_DATA, TREE_DATA, FARM_DATA, SHELTER_DATA, DEFENSE_DATA,
  INITIAL_RESOURCES, NUT_DATA, BERRY_DATA, FRUIT_DATA, SEED_DATA, VEG_DATA, INSECT_DATA, INITIAL_CAP
} from './constants';
import { 
  TreeDeciduous, Nut, Leaf, CloudRain, Sun, Snowflake, Wind, 
  Tent, Bug, Rat, X, Menu, Flower, Sprout, Shield, Home, Search
} from 'lucide-react';

// --- Reducer for complex state ---
type Action = 
  | { type: 'TICK' }
  | { type: 'CLICK_GATHER', resource: string, amount: number }
  | { type: 'BUY_ITEM', itemName: string, cost: Record<string, number>, category: string, capIncrease?: number }
  | { type: 'PREDATOR_EVENT', predatorName: string, loss: Record<string, number> }
  | { type: 'LOAD_GAME', state: GameState };

const initialState: GameState = {
  resources: { ...INITIAL_RESOURCES },
  inventory: {},
  unlocked: ['Acorns'],
  season: 'Spring',
  day: 1,
  timeOfDay: 0,
  logs: [{ id: 'init', message: 'Welcome! Gather Acorns, recruit Squirrels, and build your sanctuary.', type: 'info', timestamp: Date.now() }],
  seasonTimer: 0,
  clickPower: 1,
  maxSquirrels: INITIAL_CAP,
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'TICK': {
      // Passive generation
      const newResources = { ...state.resources };
      let logs = [...state.logs];

      // Helper for production
      const applyProduction = (entityList: GameEntity[]) => {
        entityList.forEach(entity => {
          const count = state.inventory[entity.name] || 0;
          if (count > 0 && entity.production) {
            Object.entries(entity.production).forEach(([res, amount]) => {
              // Season Modifiers
              let modifier = 1;
              if (state.season === 'Winter') modifier = 0.5;
              if (state.season === 'Autumn') modifier = 1.25;
              if (state.season === 'Spring' && (entity.type === 'Bush' || entity.type === 'Tree')) modifier = 1.5;
              
              newResources[res] = (newResources[res] || 0) + (amount * count * modifier) / 10;
            });
          }
        });
      };

      applyProduction(SQUIRREL_DATA);
      applyProduction(BUSH_DATA);
      applyProduction(TREE_DATA);
      applyProduction(FARM_DATA);

      // Time & Season Logic
      let newTimeOfDay = state.timeOfDay + 0.1;
      let newDay = state.day;
      let newSeason = state.season;
      let newSeasonTimer = state.seasonTimer + 0.1;

      if (newTimeOfDay >= 100) {
        newTimeOfDay = 0;
        newDay += 1;
      }

      if (newSeasonTimer >= SEASON_DURATION) {
        newSeasonTimer = 0;
        const currentSeasonIdx = SEASONS.indexOf(state.season);
        newSeason = SEASONS[(currentSeasonIdx + 1) % SEASONS.length];
        logs.push({
          id: Date.now().toString(),
          message: `The season has changed to ${newSeason}!`,
          type: 'info',
          timestamp: Date.now()
        });
      }

      return {
        ...state,
        resources: newResources,
        timeOfDay: newTimeOfDay,
        day: newDay,
        season: newSeason,
        seasonTimer: newSeasonTimer,
        logs: logs.slice(-30)
      };
    }

    case 'CLICK_GATHER': {
      const { resource, amount } = action;
      return {
        ...state,
        resources: {
          ...state.resources,
          [resource]: (state.resources[resource] || 0) + amount
        }
      };
    }

    case 'BUY_ITEM': {
      const { itemName, cost, capIncrease } = action;
      const newResources = { ...state.resources };
      
      Object.entries(cost).forEach(([res, amount]) => {
        newResources[res] -= amount;
      });

      return {
        ...state,
        resources: newResources,
        inventory: {
          ...state.inventory,
          [itemName]: (state.inventory[itemName] || 0) + 1
        },
        maxSquirrels: state.maxSquirrels + (capIncrease || 0),
        logs: [
          ...state.logs,
          { id: Date.now().toString(), message: `Acquired ${itemName}!`, type: 'success', timestamp: Date.now() }
        ]
      };
    }

    case 'PREDATOR_EVENT': {
      const { predatorName, loss } = action;
      const newResources = { ...state.resources };
      const lostInfo: string[] = [];

      Object.entries(loss).forEach(([res, amount]) => {
        if (newResources[res]) {
          const actualLoss = Math.min(newResources[res], amount);
          newResources[res] -= actualLoss;
          if (actualLoss > 0) lostInfo.push(`${Math.floor(actualLoss)} ${res}`);
        }
      });

      const message = lostInfo.length > 0 
        ? `A ${predatorName} attacked! Lost: ${lostInfo.join(', ')}.`
        : `A ${predatorName} was spotted, but you had nothing to steal!`;

      return {
        ...state,
        resources: newResources,
        logs: [
          ...state.logs,
          { id: Date.now().toString(), message, type: 'danger', timestamp: Date.now() }
        ]
      };
    }

    case 'LOAD_GAME':
      return {
        ...action.state,
        // Migration safety for old saves
        maxSquirrels: action.state.maxSquirrels || INITIAL_CAP 
      };

    default:
      return state;
  }
};

// --- Components ---

interface ResourcePillProps {
  name: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
}

const ResourcePill: React.FC<ResourcePillProps> = ({ name, value, icon, color }) => (
  <div className={`flex items-center justify-between p-2 rounded mb-1 border backdrop-blur-sm ${color || 'bg-emerald-900/40 border-emerald-800/50'}`}>
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs font-medium text-emerald-100">{name}</span>
    </div>
    <span className="font-mono text-xs text-amber-300">{Math.floor(value).toLocaleString()}</span>
  </div>
);

interface ShopItemProps {
  item: GameEntity;
  resources: Record<string, number>;
  onBuy: () => void;
  disabled?: boolean;
  locked?: boolean;
}

const ShopItem: React.FC<ShopItemProps> = ({ item, resources, onBuy, disabled, locked }) => {
  const canAfford = !locked && item.cost && Object.entries(item.cost).every(([res, amount]) => (resources[res] || 0) >= (amount as number));
  
  if (locked) return null;

  return (
    <div 
      className={`p-3 rounded-lg border transition-all mb-2 relative group
        ${disabled ? 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed' : 
          canAfford ? 'bg-emerald-800/60 border-emerald-600 hover:bg-emerald-700/80 cursor-pointer shadow-lg shadow-black/20' : 
          'bg-gray-900/40 border-gray-700 opacity-70 cursor-not-allowed'}`}
      onClick={() => canAfford && !disabled && onBuy()}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-amber-100 text-sm">{item.name}</h4>
        <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-900">T{item.tier}</span>
      </div>
      <p className="text-[10px] text-emerald-200/70 mb-2 min-h-[20px] leading-tight">{item.description}</p>
      
      {/* Cost Grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
        {item.cost && Object.entries(item.cost).map(([res, amount]) => (
          <div key={res} className={`flex justify-between ${ (resources[res] || 0) >= (amount as number) ? 'text-green-400' : 'text-red-400'}`}>
            <span>{res}</span>
            <span>{(amount as number).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg text-xs font-bold text-red-300">
           Cap Reached
        </div>
      )}
    </div>
  );
};

const LogPanel = ({ logs }: { logs: LogEntry[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-black/40 h-full rounded-lg p-2 overflow-y-auto font-mono text-[10px] border border-emerald-900/50 shadow-inner" ref={scrollRef}>
      {logs.map((log) => (
        <div key={log.id} className={`mb-1 ${
          log.type === 'danger' ? 'text-red-400' : 
          log.type === 'success' ? 'text-green-400' : 
          log.type === 'warning' ? 'text-amber-400' : 'text-emerald-200/80'
        }`}>
          <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span> {log.message}
        </div>
      ))}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // UI States
  const [activeShopTab, setActiveShopTab] = useState<'squirrels' | 'shelters' | 'nature' | 'farms'>('squirrels');
  const [mobileTab, setMobileTab] = useState<'game' | 'resources' | 'shop'>('game');
  
  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem('squirrelsAndNutsSave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_GAME', state: parsed });
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('squirrelsAndNutsSave', JSON.stringify(state));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state]);

  // --- Game Loop ---
  useEffect(() => {
    const loop = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100);

    const predatorCheck = setInterval(() => {
       if (Math.random() < 0.03) { // 3% chance every 5s
          // Calculate defense
          let totalDefense = 0;
          DEFENSE_DATA.forEach(d => {
            if (state.inventory[d.name]) totalDefense += state.inventory[d.name] * (d.defense || 0);
          });
          
          // Attack logic
          const attackStrength = Math.random() * 100;
          if (attackStrength > totalDefense) {
            const tier = Math.floor(Math.random() * 3);
            const predator = RAW_DATA[tier].predator;
            const resourceToLose = RAW_DATA[tier].nut;
            const lossAmount = Math.floor((Math.random() * 50) + 10);
            dispatch({ type: 'PREDATOR_EVENT', predatorName: predator, loss: { [resourceToLose]: lossAmount } });
          }
       }
    }, 5000);

    return () => {
      clearInterval(loop);
      clearInterval(predatorCheck);
    };
  }, [state.inventory]); // Depend on inventory for defense calcs

  // --- Handlers ---
  const handleBigNutClick = () => {
    dispatch({ type: 'CLICK_GATHER', resource: 'Acorns', amount: state.clickPower });
  };

  const buyItem = (item: GameEntity) => {
    dispatch({ 
      type: 'BUY_ITEM', 
      itemName: item.name, 
      cost: item.cost || {}, 
      category: item.type,
      capIncrease: item.capIncrease 
    });
  };

  const getTotalSquirrels = () => {
    return SQUIRREL_DATA.reduce((acc, s) => acc + (state.inventory[s.name] || 0), 0);
  };

  const SeasonIcon = {
    'Spring': <CloudRain className="w-4 h-4 text-blue-400" />,
    'Summer': <Sun className="w-4 h-4 text-yellow-400" />,
    'Autumn': <Wind className="w-4 h-4 text-orange-400" />,
    'Winter': <Snowflake className="w-4 h-4 text-cyan-200" />
  }[state.season];

  const SeasonColor = {
    'Spring': 'from-green-900 to-emerald-950',
    'Summer': 'from-emerald-800 to-green-900',
    'Autumn': 'from-orange-900 to-amber-950',
    'Winter': 'from-slate-900 to-gray-900'
  }[state.season];

  const currentSquirrels = getTotalSquirrels();

  return (
    <div className={`flex flex-col h-screen w-full bg-gradient-to-b ${SeasonColor} text-amber-50 overflow-hidden font-sans`}>
      
      {/* HEADER */}
      <header className="flex-none h-14 bg-black/40 border-b border-white/10 flex items-center justify-between px-4 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-1.5 rounded-lg shadow-lg shadow-amber-900/50 animate-bounce-slow">
             <Nut className="text-white fill-amber-300 w-5 h-5" />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-lg tracking-tight text-amber-100 drop-shadow-md">Squirrels & Nuts</h1>
            <div className="flex gap-2 text-[10px] text-amber-200/70 font-mono">
              <span>Day {state.day}</span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1">{SeasonIcon} {state.season}</span>
            </div>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="flex items-center gap-4 text-xs">
           <div className="flex flex-col items-end">
             <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Population</span>
             <span className={`font-mono ${currentSquirrels >= state.maxSquirrels ? 'text-red-400' : 'text-white'}`}>
               {currentSquirrels} / {state.maxSquirrels}
             </span>
           </div>
        </div>
      </header>

      {/* MOBILE LAYOUT WRAPPER */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- LEFT SIDEBAR: RESOURCES --- */}
        <aside className={`
          flex-col bg-black/20 border-r border-white/5 backdrop-blur-sm z-10 transition-all duration-300
          ${mobileTab === 'resources' ? 'absolute inset-0 flex' : 'hidden md:flex w-64'}
        `}>
          <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <h2 className="font-bold text-emerald-400 uppercase text-xs tracking-wider">Resources</h2>
            {mobileTab === 'resources' && <button onClick={() => setMobileTab('game')}><X size={18} /></button>}
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
             {/* Always show Acorns */}
             <ResourcePill name="Acorns" value={state.resources["Acorns"] || 0} icon={<Nut size={12} />} color="bg-amber-900/40 border-amber-700/30" />
             
             {/* Render resource groups if they exist */}
             {[
               { title: 'Nuts', data: NUT_DATA, icon: <Nut size={12} />, color: 'bg-amber-900/30 border-amber-800/30' },
               { title: 'Berries', data: BERRY_DATA, icon: <Leaf size={12} />, color: 'bg-red-900/30 border-red-800/30' },
               { title: 'Vegetation', data: VEG_DATA, icon: <Sprout size={12} />, color: 'bg-green-900/30 border-green-800/30' },
               { title: 'Seeds', data: SEED_DATA, icon: <Leaf size={12} className="text-yellow-200"/>, color: 'bg-yellow-900/20 border-yellow-800/30' },
               { title: 'Fruits', data: FRUIT_DATA, icon: <Nut size={12} className="text-orange-300"/>, color: 'bg-orange-900/30 border-orange-800/30' },
               { title: 'Insects', data: INSECT_DATA, icon: <Bug size={12} />, color: 'bg-blue-900/30 border-blue-800/30' },
             ].map(group => {
               const owned = group.data.filter(item => state.resources[item.name] > 0);
               if (owned.length === 0) return null;
               return (
                 <div key={group.title}>
                   <h3 className="text-[10px] font-bold text-white/40 mb-1 uppercase pl-1">{group.title}</h3>
                   {owned.map(item => (
                     <ResourcePill key={item.name} name={item.name} value={state.resources[item.name]} icon={group.icon} color={group.color} />
                   ))}
                 </div>
               );
             })}
          </div>
        </aside>

        {/* --- CENTER: GAME --- */}
        <main className={`
          flex-1 relative flex flex-col bg-gradient-to-b from-transparent to-black/30
          ${mobileTab === 'game' ? 'flex' : 'hidden md:flex'}
        `}>
          {/* Ambient Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
             {Array.from({length: 6}).map((_, i) => (
                <TreeDeciduous key={i} className="absolute text-emerald-950 animate-pulse" 
                  style={{
                    bottom: '-40px', 
                    left: `${i * 18}%`, 
                    width: `${80 + Math.random() * 100}px`, 
                    height: `${80 + Math.random() * 100}px`,
                    transform: `scale(${1 + Math.random() * 0.5})`,
                    animationDuration: `${3 + Math.random() * 5}s`
                  }} 
                />
             ))}
          </div>

          {/* Click Area */}
          <div className="flex-1 flex flex-col items-center justify-center relative z-0 p-4 min-h-[300px]">
            <button 
              onClick={handleBigNutClick}
              className="group relative w-40 h-40 md:w-56 md:h-56 transition-all active:scale-95 outline-none touch-manipulation"
            >
              <div className="absolute inset-0 bg-amber-600/20 rounded-full blur-3xl group-hover:bg-amber-500/30 transition-all duration-500"></div>
              <div className="relative w-full h-full flex items-center justify-center drop-shadow-2xl filter hover:drop-shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-700 stroke-amber-900 stroke-2 overflow-visible">
                   <path d="M50 5 C 30 5, 20 25, 20 35 C 20 35, 15 35, 15 40 C 15 50, 20 50, 20 50 C 20 80, 35 95, 50 95 C 65 95, 80 80, 80 50 C 80 50, 85 50, 85 40 C 85 35, 80 35, 80 35 C 80 25, 70 5, 50 5 Z" className="fill-amber-600 group-hover:fill-amber-500 transition-colors" />
                   <path d="M20 35 C 20 35, 30 25, 50 25 C 70 25, 80 35, 80 35 L 80 40 C 80 45, 20 45, 20 40 Z" className="fill-amber-900/80" />
                   <path d="M50 5 L 50 25" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-active:opacity-100 group-active:-translate-y-8 transition-all duration-300 text-3xl font-bold text-amber-300 pointer-events-none drop-shadow-lg">
                +{state.clickPower}
              </div>
            </button>
            <p className="mt-6 text-emerald-200/50 text-xs font-medium uppercase tracking-widest animate-pulse">Tap to Gather</p>
            
            {/* Quick Visuals */}
            <div className="mt-8 flex gap-4">
               <div className="flex flex-col items-center bg-black/20 p-2 rounded-lg border border-white/5 w-24">
                 <Rat className="text-amber-500 mb-1" size={20} />
                 <span className="text-xs font-bold">{currentSquirrels}</span>
                 <span className="text-[9px] text-white/40 uppercase">Squirrels</span>
               </div>
               <div className="flex flex-col items-center bg-black/20 p-2 rounded-lg border border-white/5 w-24">
                 <Home className="text-green-500 mb-1" size={20} />
                 <span className="text-xs font-bold">{state.maxSquirrels}</span>
                 <span className="text-[9px] text-white/40 uppercase">Capacity</span>
               </div>
            </div>
          </div>

          {/* Logs */}
          <div className="h-32 md:h-48 p-4 w-full max-w-3xl mx-auto">
             <LogPanel logs={state.logs} />
          </div>
        </main>

        {/* --- RIGHT SIDEBAR: SHOP --- */}
        <aside className={`
          flex-col bg-gray-900/90 backdrop-blur-md z-10 border-l border-white/10 transition-all duration-300
          ${mobileTab === 'shop' ? 'absolute inset-0 flex' : 'hidden md:flex w-80'}
        `}>
           <div className="flex-none p-2 border-b border-white/10 flex flex-col gap-2">
             <div className="flex justify-between items-center md:hidden">
               <h2 className="font-bold text-emerald-400 uppercase text-xs tracking-wider">Management</h2>
               <button onClick={() => setMobileTab('game')}><X size={18} /></button>
             </div>
             
             {/* Shop Tabs */}
             <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-lg">
                <button onClick={() => setActiveShopTab('squirrels')} className={`flex items-center justify-center p-2 rounded ${activeShopTab === 'squirrels' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                  <Rat size={16} />
                </button>
                <button onClick={() => setActiveShopTab('shelters')} className={`flex items-center justify-center p-2 rounded ${activeShopTab === 'shelters' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                  <Home size={16} />
                </button>
                <button onClick={() => setActiveShopTab('nature')} className={`flex items-center justify-center p-2 rounded ${activeShopTab === 'nature' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                  <TreeDeciduous size={16} />
                </button>
                <button onClick={() => setActiveShopTab('farms')} className={`flex items-center justify-center p-2 rounded ${activeShopTab === 'farms' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                  <Shield size={16} />
                </button>
             </div>
             <div className="text-[10px] text-center text-white/30 uppercase tracking-widest font-bold">
               {activeShopTab === 'squirrels' && 'Recruitment'}
               {activeShopTab === 'shelters' && 'Habitat Expansion'}
               {activeShopTab === 'nature' && 'Flora & Growth'}
               {activeShopTab === 'farms' && 'Ecosystem & Defense'}
             </div>
           </div>
          
           <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
              {activeShopTab === 'squirrels' && SQUIRREL_DATA.map(item => (
                <ShopItem key={item.name} item={item} resources={state.resources} onBuy={() => buyItem(item)} disabled={currentSquirrels >= state.maxSquirrels} />
              ))}
              
              {activeShopTab === 'shelters' && SHELTER_DATA.map(item => (
                <ShopItem key={item.name} item={item} resources={state.resources} onBuy={() => buyItem(item)} />
              ))}

              {activeShopTab === 'nature' && (
                <>
                  <div className="text-xs font-bold text-emerald-500 uppercase my-2 pl-1">Bushes</div>
                  {BUSH_DATA.map(item => <ShopItem key={item.name} item={item} resources={state.resources} onBuy={() => buyItem(item)} />)}
                  <div className="text-xs font-bold text-emerald-500 uppercase my-2 pl-1">Trees</div>
                  {TREE_DATA.map(item => <ShopItem key={item.name} item={item} resources={state.resources} onBuy={() => buyItem(item)} />)}
                </>
              )}

              {activeShopTab === 'farms' && (
                <>
                  <div className="text-xs font-bold text-blue-400 uppercase my-2 pl-1">Insect Farms</div>
                  {FARM_DATA.map(item => <ShopItem key={item.name} item={item} resources={state.resources} onBuy={() => buyItem(item)} />)}
                  <div className="text-xs font-bold text-red-400 uppercase my-2 pl-1">Defense</div>
                  {DEFENSE_DATA.map(item => <ShopItem key={item.name} item={item} resources={state.resources} onBuy={() => buyItem(item)} />)}
                </>
              )}
           </div>
        </aside>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden flex h-14 bg-black/80 border-t border-white/10 backdrop-blur-md z-30">
        <button 
          onClick={() => setMobileTab('resources')} 
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${mobileTab === 'resources' ? 'text-emerald-400' : 'text-gray-500'}`}
        >
          <Menu size={18} />
          <span className="text-[9px] uppercase font-bold">Stock</span>
        </button>
        <button 
          onClick={() => setMobileTab('game')} 
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${mobileTab === 'game' ? 'text-amber-400' : 'text-gray-500'}`}
        >
          <Nut size={20} />
          <span className="text-[9px] uppercase font-bold">Gather</span>
        </button>
        <button 
          onClick={() => setMobileTab('shop')} 
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${mobileTab === 'shop' ? 'text-blue-400' : 'text-gray-500'}`}
        >
          <Home size={18} />
          <span className="text-[9px] uppercase font-bold">Build</span>
        </button>
      </nav>

    </div>
  );
};

export default App;