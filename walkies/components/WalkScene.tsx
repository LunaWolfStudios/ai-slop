
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Dog, Sparkles, MapPin } from 'lucide-react';
import { GameState } from '../types';
import { generateAdventureSegment, AdventureSegment } from '../services/geminiService';

interface WalkSceneProps {
  state: GameState;
  onUpdate: (update: Partial<GameState>) => void;
  onFinish: () => void;
}

const WalkScene: React.FC<WalkSceneProps> = ({ state, onUpdate, onFinish }) => {
  const [segment, setSegment] = useState<AdventureSegment | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  const fetchSegment = async (action?: string) => {
    setLoading(true);
    const result = await generateAdventureSegment(
      state.currentLocation?.name || "The Wilds",
      state.currentLocation?.type || "nature",
      state.clankMood,
      state.progress,
      action
    );
    
    setSegment(result);
    setLoading(false);
    
    if (result.narrative) {
      setHistory(prev => [result.narrative, ...prev].slice(0, 3));
      // Save to journal
      const newEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        locationName: state.currentLocation?.name || "Unknown",
        content: result.narrative,
        clankBehavior: result.clankAction
      };
      onUpdate({ journal: [newEntry, ...state.journal] });
    }
  };

  useEffect(() => {
    fetchSegment();
  }, []);

  const handleChoice = (choice: { text: string; nextMood: string }) => {
    const nextProgress = Math.min(100, state.progress + 15);
    onUpdate({ 
      progress: nextProgress, 
      clankMood: choice.nextMood as any 
    });
    fetchSegment(choice.text);
  };

  return (
    <div className="min-h-full flex flex-col bg-[#FDFBF7]">
      {/* Immersive Header */}
      <div className="sticky top-0 z-20 bg-[#FDFBF7]/80 backdrop-blur-md p-6 flex justify-between items-center border-b border-stone-100">
        <button 
          onClick={onFinish}
          className="p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-600"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">Exploring</span>
          <h2 className="text-xl font-serif text-stone-800">{state.currentLocation?.name}</h2>
        </div>
        <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
           <MapPin size={12} className="text-amber-600" />
           <span className="text-[10px] font-bold text-amber-800 uppercase tracking-tighter">{state.progress}%</span>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full p-8 flex flex-col">
        {/* Story Content */}
        <div className="flex-1 space-y-12 mb-12">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-64 flex flex-col items-center justify-center space-y-4 text-stone-300"
              >
                <div className="animate-pulse flex flex-col items-center">
                  <Dog size={48} />
                  <p className="mt-4 font-serif italic">Listening to the world...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={segment?.narrative}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="relative">
                   <div className="absolute -left-6 top-0 text-amber-200"><Sparkles size={20} /></div>
                   <p className="text-xl md:text-2xl font-serif leading-relaxed text-stone-800 italic">
                    {segment?.narrative}
                  </p>
                </div>

                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 flex items-start space-x-4">
                  <div className="bg-amber-600 text-white p-2 rounded-xl shrink-0">
                    <Dog size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-800/60 mb-1">Clank</h4>
                    <p className="text-stone-700 leading-relaxed font-medium">
                      {segment?.clankAction}
                    </p>
                  </div>
                </div>

                {/* History (faded out) */}
                <div className="pt-8 border-t border-stone-100 space-y-4">
                  {history.slice(1).map((h, i) => (
                    <p key={i} className="text-stone-400 text-sm italic font-serif opacity-60">
                      {h}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Choices / Actions */}
        {!loading && (
          <div className="sticky bottom-8 space-y-4 bg-[#FDFBF7] pt-4">
            {state.progress < 100 ? (
              <div className="grid grid-cols-1 gap-3">
                {segment?.choices.map((choice, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChoice(choice)}
                    className="group flex items-center justify-between p-5 bg-white border border-stone-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all text-left"
                  >
                    <span className="text-stone-700 font-serif text-lg">{choice.text}</span>
                    <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                      →
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 bg-stone-800 text-white p-10 rounded-[3rem]"
              >
                <div className="flex justify-center mb-4"><Dog size={48} className="text-amber-400" /></div>
                <h3 className="text-2xl font-serif italic">"It was a good walk, wasn't it?"</h3>
                <p className="text-stone-400 text-sm max-w-xs mx-auto">
                  You and Clank find a perfect spot to sit and watch the world go by for a while.
                </p>
                <button
                  onClick={onFinish}
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-serif text-lg transition-all"
                >
                  Head back home
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalkScene;
