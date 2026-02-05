
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, GameView, Location } from './types';
import { LOCATIONS } from './constants';
import WalkScene from './components/WalkScene';
import JournalMap from './components/JournalMap';
import { Dog, Footprints, BookOpen, Compass, Music, Volume2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<GameView>(GameView.MENU);
  const [gameState, setGameState] = useState<GameState>({
    currentLocation: null,
    progress: 0,
    visitedLocations: ['home-streets'],
    snacks: [],
    journal: [],
    clankMood: 'chill',
    isWalking: false,
    isDriving: false,
    stamina: 100,
  });

  const updateState = (update: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...update }));
  };

  const startWalk = (loc: Location) => {
    updateState({ isDriving: true });
    setView(GameView.DRIVE);
    
    // Simulate driving / travel time
    setTimeout(() => {
      updateState({ 
        currentLocation: loc, 
        progress: 0, 
        isDriving: false,
        isWalking: false,
        clankMood: 'excited'
      });
      setView(GameView.WALK);
    }, 2000);
  };

  const finishWalk = () => {
    if (gameState.currentLocation) {
      const visited = [...gameState.visitedLocations];
      if (!visited.includes(gameState.currentLocation.id)) {
        visited.push(gameState.currentLocation.id);
      }
      updateState({ visitedLocations: visited, currentLocation: null, progress: 0 });
    }
    setView(GameView.MENU);
  };

  return (
    <div className="fixed inset-0 bg-[#FDFBF7] font-sans text-stone-900 select-none overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* Main Menu */}
        {view === GameView.MENU && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="mb-12 relative">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-amber-600"
              >
                <Dog size={120} strokeWidth={1} />
              </motion.div>
              <div className="mt-4">
                <h1 className="text-5xl font-serif tracking-tighter text-stone-800">Walkies</h1>
                <p className="text-stone-400 mt-2 uppercase tracking-[0.2em] text-[10px] font-bold">A text adventure about companionship</p>
              </div>
            </div>

            <div className="flex flex-col space-y-4 w-full max-w-xs">
              <button 
                onClick={() => setView(GameView.MAP)}
                className="group flex items-center justify-between px-6 py-4 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-amber-400 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Footprints size={24} />
                  </div>
                  <span className="font-serif text-lg">Go for a walk</span>
                </div>
                <Compass size={18} className="text-stone-300" />
              </button>

              <button 
                onClick={() => setView(GameView.JOURNAL)}
                className="group flex items-center justify-between px-6 py-4 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-amber-400 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-stone-50 text-stone-600 rounded-xl group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <span className="font-serif text-lg">Memory Journal</span>
                </div>
                <Compass size={18} className="text-stone-300" />
              </button>
            </div>

            <div className="mt-16 flex space-x-6 text-stone-300">
              <Music size={20} className="hover:text-amber-400 cursor-pointer transition-colors" />
              <Volume2 size={20} className="hover:text-amber-400 cursor-pointer transition-colors" />
            </div>
          </motion.div>
        )}

        {/* Driving Transition */}
        {view === GameView.DRIVE && (
          <motion.div 
            key="drive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center bg-[#f4f1ea] p-8 text-center"
          >
            <motion.div
              animate={{ x: [-20, 20, -20] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-5xl mb-8"
            >
              🚗
            </motion.div>
            <h2 className="text-2xl font-serif text-stone-600 italic">Travel time...</h2>
            <p className="text-stone-400 mt-4 text-sm font-serif">Clank is watching the world blur by the window.</p>
          </motion.div>
        )}

        {/* Map / Discovery View */}
        {(view === GameView.MAP || view === GameView.JOURNAL) && (
          <motion.div 
            key="map"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full overflow-y-auto"
          >
            <JournalMap 
              state={gameState} 
              onSelectLocation={startWalk}
              onClose={() => setView(GameView.MENU)}
            />
          </motion.div>
        )}

        {/* Active Walk View */}
        {view === GameView.WALK && (
          <motion.div 
            key="walk"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full overflow-y-auto"
          >
            <WalkScene 
              state={gameState} 
              onUpdate={updateState} 
              onFinish={finishWalk}
            />
          </motion.div>
        )}

      </AnimatePresence>

      <div className="fixed bottom-4 left-4 text-[10px] text-stone-300 uppercase tracking-widest pointer-events-none">
        Walkies • companionship & memory
      </div>
    </div>
  );
};

export default App;
