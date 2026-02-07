import React, { useState } from 'react';
import { CardRank } from '../types';
import { ChevronDown, ChevronUp, Calculator } from 'lucide-react';

interface CardInventoryProps {
  composition: Record<CardRank, number>;
  cardsRemaining: number;
}

export const CardInventory: React.FC<CardInventoryProps> = ({ composition, cardsRemaining }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  return (
    <div className="bg-casino-800/20 border border-casino-700/50 rounded-xl overflow-hidden backdrop-blur-sm mt-6 transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-casino-800/50 hover:bg-casino-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
            <Calculator size={16} className="text-cyan-500" />
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Card Inventory & Probabilities</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      
      {isOpen && (
        <div className="p-4 overflow-x-auto">
          <div className="grid grid-cols-7 sm:grid-cols-13 gap-2 min-w-[340px]">
            {ranks.map(rank => {
                const count = composition[rank];
                const percentage = cardsRemaining > 0 ? (count / cardsRemaining) * 100 : 0;
                
                return (
                    <div key={rank} className="flex flex-col items-center p-2 rounded bg-casino-900/40 border border-white/5">
                        <span className={`text-sm font-mono font-bold mb-1 ${['10','J','Q','K','A'].includes(rank) ? 'text-indigo-400' : 'text-emerald-400'}`}>
                            {rank}
                        </span>
                        <span className="text-sm text-white font-medium">{count}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">{percentage.toFixed(1)}%</span>
                    </div>
                )
            })}
          </div>
        </div>
      )}
    </div>
  );
};
