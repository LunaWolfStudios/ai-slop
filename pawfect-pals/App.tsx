import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AVAILABLE_PETS, INITIAL_COINS, SHOP_ITEMS } from './constants';
import { ActivePet, GameState, Personality, PetConfig, PetState, Item } from './types';
import PetAvatar from './components/PetAvatar';
import StatsDisplay from './components/StatsDisplay';
import Controls from './components/Controls';
import { generatePetThought } from './services/geminiService';
import { Coins, ShoppingBag, Trophy, X } from 'lucide-react';

const TICK_RATE = 3000; // Game loop tick every 3 seconds

const App: React.FC = () => {
  // ---------------- State ----------------
  const [gameState, setGameState] = useState<GameState>({
    coins: INITIAL_COINS,
    inventory: [],
    activePet: null,
    gameTime: 0
  });

  const [showShop, setShowShop] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<PetConfig | null>(null);
  
  // New state for the visual effect of an item being thrown
  const [flyingItem, setFlyingItem] = useState<Item | null>(null);

  // UseRef for the loop interval to avoid dependency hell
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // ---------------- Game Loop ----------------
  useEffect(() => {
    const loop = setInterval(() => {
      const current = stateRef.current;
      if (!current.activePet) return;

      const pet = current.activePet;
      let newStats = { ...pet.stats };
      let newState = pet.state;
      let newThought = pet.thought;

      // 1. Natural Decay
      newStats.hunger = Math.min(100, newStats.hunger + 1); // Hunger rises
      newStats.energy = Math.max(0, newStats.energy - 0.5); // Energy falls
      newStats.happiness = Math.max(0, newStats.happiness - 0.5); // Happiness falls
      
      // 2. State Machine Logic
      // Only change state if we aren't currently busy eating/playing
      if (newState !== PetState.EATING && newState !== PetState.PLAYING) {
        if (newStats.hunger > 80) {
          newThought = "Feed me!";
          newState = PetState.UNHAPPY;
        } else if (newStats.energy < 20) {
          newThought = "So tired...";
          newState = PetState.SLEEPING;
        } else if (newState === PetState.SLEEPING && newStats.energy > 80) {
          // Wake up
          newState = PetState.IDLE;
          newThought = "I'm awake!";
        }
      }

      // Update State
      setGameState(prev => ({
        ...prev,
        gameTime: prev.gameTime + 1,
        activePet: prev.activePet ? {
          ...prev.activePet,
          stats: newStats,
          state: newState,
          thought: newThought
        } : null
      }));

    }, TICK_RATE);

    return () => clearInterval(loop);
  }, []);

  // ---------------- AI Thought Generation ----------------
  // Triggered periodically or on significant events
  useEffect(() => {
    if (!gameState.activePet) return;
    
    // 10% chance per tick to generate a new AI thought, or if thought is empty
    const roll = Math.random();
    if (roll < 0.05 || !gameState.activePet.thought) {
       generatePetThought(gameState.activePet).then(thought => {
         setGameState(prev => prev.activePet ? ({
           ...prev,
           activePet: { ...prev.activePet!, thought }
         }) : prev);
       });
    }
  }, [gameState.gameTime, gameState.activePet?.state]);


  // ---------------- Interactions ----------------

  const handleStartGame = () => {
    if (!selectedConfig) return;
    const name = customNameInput.trim() || selectedConfig.name;
    const newPet: ActivePet = {
      ...selectedConfig,
      customName: name,
      stats: { happiness: 80, hunger: 20, energy: 90, affection: 10 },
      state: PetState.IDLE,
      lastInteraction: Date.now(),
      thought: "Hello friend!"
    };
    setGameState({ ...gameState, activePet: newPet });
  };

  const handleFeed = () => {
    if (!gameState.activePet) return;
    // Basic feed action (for free/bottom bar)
    setGameState(prev => {
      if (!prev.activePet) return prev;
      return {
        ...prev,
        activePet: {
          ...prev.activePet,
          state: PetState.EATING,
          thought: "Yum!",
          stats: {
            ...prev.activePet.stats,
            hunger: Math.max(0, prev.activePet.stats.hunger - 30),
            energy: Math.min(100, prev.activePet.stats.energy + 5)
          }
        }
      };
    });
    
    // Reset to idle after animation
    setTimeout(() => {
      setGameState(prev => prev.activePet ? ({
        ...prev, 
        activePet: { ...prev.activePet, state: PetState.IDLE }
      }) : prev);
    }, 2000);
  };

  const handlePlay = () => {
    if (!gameState.activePet) return;
    if (gameState.activePet.stats.energy < 20) {
      setGameState(prev => prev.activePet ? ({
        ...prev,
        activePet: { ...prev.activePet, thought: "Too tired to play..." }
      }) : prev);
      return;
    }

    setGameState(prev => {
      if (!prev.activePet) return prev;
      const isPlayful = prev.activePet.personality === Personality.PLAYFUL;
      const happinessGain = isPlayful ? 25 : 15;
      
      return {
        ...prev,
        coins: prev.coins + 5, // Reward
        activePet: {
          ...prev.activePet,
          state: PetState.PLAYING,
          thought: "Wheee!",
          stats: {
            ...prev.activePet.stats,
            happiness: Math.min(100, prev.activePet.stats.happiness + happinessGain),
            energy: Math.max(0, prev.activePet.stats.energy - 15),
            hunger: Math.min(100, prev.activePet.stats.hunger + 10)
          }
        }
      };
    });

    setTimeout(() => {
      setGameState(prev => prev.activePet ? ({
        ...prev, 
        activePet: { ...prev.activePet, state: PetState.IDLE }
      }) : prev);
    }, 2000);
  };

  const handlePet = () => {
    if (!gameState.activePet) return;
    setGameState(prev => {
      if (!prev.activePet) return prev;
      const isShy = prev.activePet.personality === Personality.SHY;
      const affectionGain = isShy ? 2 : 5; // Harder to bond with shy pets

      return {
        ...prev,
        activePet: {
          ...prev.activePet,
          state: PetState.EXCITED,
          thought: "I love you!",
          stats: {
            ...prev.activePet.stats,
            affection: Math.min(100, prev.activePet.stats.affection + affectionGain),
            happiness: Math.min(100, prev.activePet.stats.happiness + 5)
          }
        }
      };
    });

    setTimeout(() => {
      setGameState(prev => prev.activePet ? ({
        ...prev, 
        activePet: { ...prev.activePet, state: PetState.IDLE }
      }) : prev);
    }, 1500);
  };

  const handleBuy = (item: Item) => {
    if (gameState.coins >= item.cost) {
      // 1. Deduct Coins
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - item.cost,
        // We aren't really using inventory list in this version, we consume immediately
      }));

      // 2. Close Shop
      setShowShop(false);

      // 3. Trigger Visual Throw
      setFlyingItem(item);

      // 4. After animation delay, Apply Effects to Pet
      setTimeout(() => {
        setFlyingItem(null); // Clear item
        
        setGameState(prev => {
           if (!prev.activePet) return prev;
           
           const currentStats = prev.activePet.stats;
           const effects = item.effect;
           
           return {
             ...prev,
             activePet: {
               ...prev.activePet,
               state: item.type === 'FOOD' ? PetState.EATING : PetState.PLAYING,
               thought: item.type === 'FOOD' ? 'Delish!' : 'Best toy ever!',
               stats: {
                 ...currentStats,
                 hunger: Math.max(0, Math.min(100, currentStats.hunger + (effects.hunger || 0))),
                 happiness: Math.max(0, Math.min(100, currentStats.happiness + (effects.happiness || 0))),
                 energy: Math.max(0, Math.min(100, currentStats.energy + (effects.energy || 0))),
                 affection: Math.max(0, Math.min(100, currentStats.affection + (effects.affection || 0))),
               }
             }
           };
        });

        // 5. Reset to Idle after action duration
        setTimeout(() => {
          setGameState(prev => prev.activePet ? ({
            ...prev,
            activePet: { ...prev.activePet, state: PetState.IDLE }
          }) : prev);
        }, 2000);

      }, 900); // 900ms matches the flight animation duration roughly
    }
  };

  const resetGame = () => {
    setGameState({
      coins: INITIAL_COINS,
      inventory: [],
      activePet: null,
      gameTime: 0
    });
    setCustomNameInput('');
    setSelectedConfig(null);
  };

  // ---------------- Render: Pet Selection ----------------
  if (!gameState.activePet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl w-full h-[90vh] flex flex-col">
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">Pawfect Pals</h1>
            <p className="text-slate-500">Choose your new best friend!</p>
          </div>

          <div className="flex-grow overflow-y-auto mb-6 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {AVAILABLE_PETS.map(pet => (
                <div 
                  key={pet.id}
                  onClick={() => setSelectedConfig(pet)}
                  className={`cursor-pointer border-4 rounded-2xl p-4 transition-all hover:-translate-y-2
                    ${selectedConfig?.id === pet.id ? 'border-indigo-500 bg-indigo-50 shadow-lg' : 'border-slate-100 bg-white hover:border-indigo-200'}
                  `}
                >
                  <div className={`h-32 rounded-xl mb-4 ${pet.color} flex items-center justify-center`}>
                     {pet.type === 'DOG' ? <span className="text-6xl">🐶</span> : <span className="text-6xl">🐱</span>}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{pet.name}</h3>
                  <span className="inline-block px-2 py-1 bg-slate-200 rounded text-xs text-slate-600 font-semibold mb-2">
                    {pet.personality}
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">{pet.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 pt-4 border-t border-slate-100">
            {selectedConfig ? (
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-fade-in-up">
                <input 
                  type="text" 
                  placeholder={`Name your ${selectedConfig.type.toLowerCase()}...`}
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  className="px-6 py-3 rounded-full border-2 border-slate-200 focus:border-indigo-500 outline-none w-full md:w-64 text-center text-lg"
                />
                <button 
                  onClick={handleStartGame}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition active:scale-95"
                >
                  Adopt {customNameInput || selectedConfig.name}
                </button>
              </div>
            ) : (
               <div className="text-center text-slate-400 italic">Select a pet to continue...</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Render: Game Room ----------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-100 overflow-hidden relative font-sans">
      
      {/* Flying Item Effect */}
      {flyingItem && (
        <div className="fixed bottom-0 left-1/2 -ml-8 mb-20 z-40 animate-throw pointer-events-none">
           <div className="text-6xl filter drop-shadow-xl">{flyingItem.icon}</div>
        </div>
      )}

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-50 pointer-events-none">
        {/* Left: Stats */}
        <div className="pointer-events-auto w-64">
           <StatsDisplay pet={gameState.activePet} />
        </div>

        {/* Right: Economy & Tools */}
        <div className="pointer-events-auto flex flex-col gap-3 items-end">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow border border-yellow-200 flex items-center gap-2">
            <Coins className="text-yellow-500" />
            <span className="font-bold text-slate-700">{gameState.coins}</span>
          </div>
          <button 
            onClick={() => setShowShop(true)}
            className="bg-white/90 p-3 rounded-full shadow hover:bg-white transition-colors text-indigo-600"
          >
            <ShoppingBag />
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Background Decor (Simple Shapes) */}
        <div className="absolute bottom-0 w-full h-1/3 bg-green-200 rounded-t-[50px]"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-indigo-200/50 rounded-full blur-xl"></div>
        <div className="absolute top-20 right-20 w-48 h-48 bg-yellow-200/50 rounded-full blur-xl"></div>

        {/* The Pet */}
        <div className="z-10 mt-20">
          <PetAvatar pet={gameState.activePet} />
        </div>
      </div>

      {/* Bottom Controls */}
      <Controls 
        onFeed={handleFeed}
        onPlay={handlePlay}
        onPet={handlePet}
        onReset={resetGame}
        inventory={[]}
        disabled={gameState.activePet.state === PetState.SLEEPING}
      />

      {/* Shop Modal */}
      {showShop && (
        <div className="absolute inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-scale-in max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag className="text-indigo-500" /> Pet Shop
              </h2>
              <button onClick={() => setShowShop(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-grow pr-2">
              {SHOP_ITEMS.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        {item.type === 'FOOD' ? 'Restores Hunger' : 'Boosts Happiness'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleBuy(item)}
                    disabled={gameState.coins < item.cost}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-1"
                  >
                    {item.cost} <Coins size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-slate-400 text-sm flex-shrink-0">
              Purchased items are given to your pet instantly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
