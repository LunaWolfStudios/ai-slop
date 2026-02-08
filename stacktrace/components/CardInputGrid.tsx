import React from 'react';
import { CardRank } from '../types';

interface CardInputGridProps {
  onCardInput: (rank: CardRank, label?: string) => void;
  disabled?: boolean;
  mode?: 'detailed' | 'simple';
}

interface CardButtonProps {
  rank?: string;
  label?: string;
  onClick: () => void;
  colorClass: string;
  big?: boolean;
  disabled?: boolean;
}

const CardButton: React.FC<CardButtonProps> = ({ rank, label, onClick, colorClass, big, disabled }) => (
  <button
      disabled={disabled}
      onClick={onClick}
      className={`
          relative group overflow-hidden
          ${big ? 'h-24 md:h-32 text-2xl' : 'h-14 sm:h-16 text-lg'}
          rounded-lg font-bold font-mono transition-all duration-150
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          ${colorClass}
      `}
  >
      <div className="relative z-10 flex flex-col items-center justify-center gap-1">
          <span>{label || rank}</span>
          {big && <span className="text-xs font-normal opacity-70 tracking-tight">{rank}</span>}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

const CardInputGrid: React.FC<CardInputGridProps> = ({ onCardInput, disabled, mode = 'detailed' }) => {
  
  // Helpers for generic input (simulating a card from that range for the engine)
  const handleGeneric = (type: 'low' | 'neutral' | 'high') => {
    let options: CardRank[] = [];
    if (type === 'low') options = ['2', '3', '4', '5', '6'];
    if (type === 'neutral') options = ['7', '8', '9'];
    if (type === 'high') options = ['10', 'J', 'Q', 'K', 'A'];
    
    // Pick random to keep distribution somewhat balanced visually, though user didn't specify exact card
    const randomRank = options[Math.floor(Math.random() * options.length)];
    
    // Capitalize for label
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    onCardInput(randomRank, label);
  };

  const lowCards: CardRank[] = ['2', '3', '4', '5', '6'];
  const neutralCards: CardRank[] = ['7', '8', '9'];
  const highCards: CardRank[] = ['10', 'J', 'Q', 'K', 'A'];

  // Colors
  const lowColor = 'bg-emerald-900/40 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-800/60 hover:border-emerald-400 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]';
  const neutralColor = 'bg-blue-900/40 text-blue-200 border border-blue-500/30 hover:bg-blue-800/60 hover:border-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]';
  const highColor = 'bg-purple-900/40 text-purple-200 border border-purple-500/30 hover:bg-purple-800/60 hover:border-purple-400 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]';

  if (mode === 'simple') {
    return (
        <div className="grid grid-cols-3 gap-4 p-4 bg-casino-800/50 rounded-xl border border-casino-700 shadow-xl backdrop-blur-sm">
            <CardButton 
                label="Low" rank="2-6" 
                colorClass={lowColor} 
                onClick={() => handleGeneric('low')} 
                disabled={disabled}
                big 
            />
            <CardButton 
                label="Neutral" rank="7-9" 
                colorClass={neutralColor} 
                onClick={() => handleGeneric('neutral')} 
                disabled={disabled}
                big 
            />
            <CardButton 
                label="High" rank="10-A" 
                colorClass={highColor} 
                onClick={() => handleGeneric('high')} 
                disabled={disabled}
                big 
            />
        </div>
    );
  }

  // Detailed Mode - Groups
  return (
    <div className="p-4 bg-casino-800/50 rounded-xl border border-casino-700 shadow-xl backdrop-blur-sm space-y-4">
      {/* Row 1: Low Cards */}
      <div className="grid grid-cols-5 gap-3">
        {lowCards.map(rank => (
             <CardButton key={rank} rank={rank} colorClass={lowColor} onClick={() => onCardInput(rank)} disabled={disabled} />
        ))}
      </div>

      {/* Row 2: Neutral Cards */}
      {/* We use a grid of 5 but fill only first 3 to keep alignment with rows above/below in terms of width logic if we wanted, 
          but actually separate div works better. We just map the 3 items. */}
      <div className="grid grid-cols-5 gap-3">
         {neutralCards.map(rank => (
             <CardButton key={rank} rank={rank} colorClass={neutralColor} onClick={() => onCardInput(rank)} disabled={disabled} />
         ))}
         {/* Spacers to keep grid structure if needed, or just let them end. 
             If we want them strictly aligned with 2,3,4 cols, just leaving empty divs works */}
         <div className="hidden sm:block"></div>
         <div className="hidden sm:block"></div>
      </div>

      {/* Row 3: High Cards (Purple) - Always on bottom row in this stacked layout */}
      <div className="grid grid-cols-5 gap-3">
        {highCards.map(rank => (
             <CardButton key={rank} rank={rank} colorClass={highColor} onClick={() => onCardInput(rank)} disabled={disabled} />
        ))}
      </div>
    </div>
  );
};

export default CardInputGrid;