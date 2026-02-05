
import React from 'react';
import { motion } from 'framer-motion';
import { Book, Map as MapIcon, Star, CheckCircle2 } from 'lucide-react';
import { LOCATIONS } from '../constants';
import { GameState, Location } from '../types';

interface JournalMapProps {
  state: GameState;
  onSelectLocation: (loc: Location) => void;
  onClose: () => void;
}

const JournalMap: React.FC<JournalMapProps> = ({ state, onSelectLocation, onClose }) => {
  return (
    <div className="h-full bg-[#f4f1ea] p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-serif text-stone-800">Walkie Journal</h1>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 transition-colors"
          >
            Close
          </button>
        </div>

        <section className="mb-12">
          <div className="flex items-center space-x-2 mb-6 text-stone-600 uppercase tracking-widest text-xs font-bold">
            <MapIcon size={14} />
            <span>Places to Wander</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOCATIONS.map((loc) => {
              const isVisited = state.visitedLocations.includes(loc.id);
              const isUnlocked = loc.unlocked || isVisited;

              return (
                <motion.button
                  key={loc.id}
                  whileHover={isUnlocked ? { y: -2 } : {}}
                  onClick={() => isUnlocked && onSelectLocation(loc)}
                  disabled={!isUnlocked}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                    isUnlocked 
                      ? 'bg-white border-amber-100 hover:border-amber-300 shadow-sm' 
                      : 'bg-stone-200 border-transparent opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-lg text-stone-800">
                      {isUnlocked ? loc.name : '???'}
                    </h3>
                    {isVisited && <CheckCircle2 size={16} className="text-green-600" />}
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-2">
                    {isUnlocked ? loc.description : 'A place yet to be discovered...'}
                  </p>
                  
                  {!isUnlocked && (
                    <div className="mt-4 text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                      Visit other places to unlock
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center space-x-2 mb-6 text-stone-600 uppercase tracking-widest text-xs font-bold">
            <Star size={14} />
            <span>Snacks & Memories</span>
          </div>
          
          {state.snacks.length === 0 ? (
            <div className="bg-stone-100/50 rounded-xl p-8 border-2 border-dashed border-stone-200 text-center">
              <p className="text-stone-400 font-serif italic">No snacks found yet. Clank is waiting patiently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {state.snacks.map(snack => (
                <div key={snack.id} className="bg-white p-4 rounded-xl border border-amber-100 text-center shadow-sm">
                  <div className="text-2xl mb-2">🦴</div>
                  <h4 className="text-xs font-bold text-stone-800 mb-1">{snack.name}</h4>
                  <p className="text-[10px] text-stone-400">{snack.type}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-6 text-stone-600 uppercase tracking-widest text-xs font-bold">
            <Book size={14} />
            <span>Recent Observations</span>
          </div>
          
          <div className="space-y-4">
            {state.journal.slice(0, 5).map(entry => (
              <div key={entry.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-xs font-bold text-amber-700">{entry.locationName}</span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-stone-700 font-serif text-sm italic mb-2">"{entry.content}"</p>
                {entry.clankBehavior && (
                  <p className="text-xs text-stone-400">Clank: {entry.clankBehavior}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default JournalMap;
