import React from 'react';
import { CARD_RANKS } from '../constants';
import { CardRank } from '../types';

interface CardInputGridProps {
  onCardInput: (rank: CardRank) => void;
  disabled?: boolean;
}

const CardInputGrid: React.FC<CardInputGridProps> = ({ onCardInput, disabled }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-4 bg-casino-800/50 rounded-xl border border-casino-700 shadow-xl backdrop-blur-sm">
      {CARD_RANKS.map((rank) => (
        <button
          key={rank}
          disabled={disabled}
          onClick={() => onCardInput(rank)}
          className={`
            relative group overflow-hidden
            h-14 sm:h-16 rounded-lg text-lg font-bold font-mono transition-all duration-150
            active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            ${['10', 'J', 'Q', 'K', 'A'].includes(rank) 
              ? 'bg-indigo-900/40 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-800/60 hover:border-indigo-400 hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]' 
              : 'bg-emerald-900/40 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-800/60 hover:border-emerald-400 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]'
            }
          `}
        >
          <span className="relative z-10">{rank}</span>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
};

export default CardInputGrid;
