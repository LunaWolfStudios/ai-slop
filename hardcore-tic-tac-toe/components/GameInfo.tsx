import React, { useRef, useEffect, useState } from 'react';
import { HistoryEntry, Player } from '../types';
import { ScrollText, Trophy, Hash, ChevronDown, ChevronUp } from 'lucide-react';

interface GameInfoProps {
  turnCount: number;
  sessionWins: Record<Player, number>;
  history: HistoryEntry[];
  currentPlayer: Player;
}

const GameInfo: React.FC<GameInfoProps> = ({ turnCount, sessionWins, history, currentPlayer }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-scroll history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isCollapsed]);

  return (
    <div className="fixed top-16 right-4 z-30 flex flex-col gap-2 w-64 pointer-events-none md:pointer-events-auto opacity-90 hover:opacity-100 transition-opacity">
      {/* Stats Card */}
      <div className="bg-black/80 backdrop-blur-md border border-neon-blue/30 rounded-lg p-3 text-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-auto">
         <div className="flex flex-col gap-1 pb-1">
            <div className="flex items-center gap-1 text-neon-yellow mb-1 border-b border-gray-700 pb-1">
                <Hash size={14} /> 
                <span className="font-mono font-bold">TURN {turnCount}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className="flex items-center gap-1">
                   <span className="text-neon-blue font-bold w-4">X:</span>
                   <span className="text-white">{sessionWins.X}</span>
                </div>
                <div className="flex items-center gap-1">
                   <span className="text-neon-pink font-bold w-4">O:</span>
                   <span className="text-white">{sessionWins.O}</span>
                </div>
                <div className="flex items-center gap-1">
                   <span className="text-neon-purple font-bold w-4">Z:</span>
                   <span className="text-white">{sessionWins.Z}</span>
                </div>
                <div className="flex items-center gap-1">
                   <span className="text-neon-orange font-bold w-4">A:</span>
                   <span className="text-white">{sessionWins.A}</span>
                </div>
            </div>
         </div>
      </div>

      {/* History Feed */}
      <div className="bg-black/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto overflow-hidden transition-all duration-300">
         <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-800 text-gray-400 uppercase tracking-wider font-bold text-xs w-full"
         >
            <div className="flex items-center gap-2">
                <ScrollText size={12} /> Match Log
            </div>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
         </button>
         
         {!isCollapsed && (
             <div ref={scrollRef} className="overflow-y-auto p-3 space-y-1 max-h-[30vh] custom-scrollbar border-t border-gray-800">
                {history.length === 0 && <div className="text-gray-600 italic text-xs">Game started...</div>}
                {history.map((entry, idx) => (
                    <div key={idx} className="flex gap-2 text-xs">
                        <span className="text-gray-500 font-mono w-4">{entry.turn}.</span>
                        <span className={`font-bold
                           ${entry.player === 'X' ? 'text-neon-blue' : ''}
                           ${entry.player === 'O' ? 'text-neon-pink' : ''}
                           ${entry.player === 'Z' ? 'text-neon-purple' : ''}
                           ${entry.player === 'A' ? 'text-neon-orange' : ''}
                        `}>
                            {entry.player}
                        </span>
                        <span className="text-gray-300 break-words flex-1 leading-tight">{entry.description}</span>
                    </div>
                ))}
             </div>
         )}
      </div>
    </div>
  );
};

export default GameInfo;