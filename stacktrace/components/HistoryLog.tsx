import React, { useRef, useEffect, useState } from 'react';
import { CardEvent, CountingSystem } from '../types';
import { RotateCcw, ChevronDown, ChevronUp, ScrollText } from 'lucide-react';

interface HistoryLogProps {
  history: CardEvent[];
  system: CountingSystem;
  onUndo: (id: string) => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history, system, onUndo }) => {
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  return (
    <div className="flex flex-col h-fit rounded-xl overflow-hidden bg-casino-800/20 border border-casino-700/50 backdrop-blur-sm transition-all duration-300 w-full">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between p-4 bg-casino-800/50 hover:bg-casino-700/50 transition-colors w-full"
        >
             <div className="flex items-center gap-2">
                <ScrollText size={16} className="text-cyan-500" />
                <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Session Log</span>
             </div>
             {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </button>

        {isOpen && (
            <div className="flex-1 min-h-[300px] lg:min-h-0 lg:max-h-[calc(100vh-14rem)] overflow-hidden flex flex-col p-4 pt-0">
                {history.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic py-8">
                        No cards logged yet.
                    </div>
                ) : (
                    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar max-h-[400px] lg:max-h-none">
                    {history.map((event, index) => {
                        const val = system.weights[event.rank];
                        const isNeutral = val === 0;
                        const isPositive = val > 0;
                        
                        return (
                        <div key={event.id} className="group flex items-center justify-between p-2 rounded-md bg-casino-800/30 border border-transparent hover:border-casino-700 hover:bg-casino-800/80 transition-all text-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 font-mono">
                                    {new Date(event.timestamp).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}
                                </span>
                                <span className={`font-bold font-mono w-6 text-center ${['10','J','Q','K','A'].includes(event.rank) ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                    {event.rank}
                                </span>
                                <span className={`text-xs font-mono ${isNeutral ? 'text-slate-500' : isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {val > 0 ? '+' : ''}{val}
                                </span>
                            </div>
                            
                            {index === history.length - 1 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onUndo(event.id); }}
                                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                                    title="Undo this entry"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            )}
                        </div>
                        );
                    })}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};