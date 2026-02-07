import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // User would typically need this pkg, but standard in this env
import { Settings, RefreshCw, AlertTriangle, ShieldCheck, RotateCcw } from 'lucide-react';
import { AppSettings, CardEvent, CardRank } from './types';
import { SYSTEMS, DEFAULT_SYSTEM, INITIAL_DECK_COUNT } from './constants';
import { computeGameState } from './services/analytics';
import CardInputGrid from './components/CardInputGrid';
import { Dashboard } from './components/Dashboard';
import { HistoryLog } from './components/HistoryLog';
import { CardInventory } from './components/CardInventory';

// Helper for UUID since we can't rely on external heavy libs for this simple task if not present
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // State
  const [history, setHistory] = useState<CardEvent[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    decks: INITIAL_DECK_COUNT,
    systemId: DEFAULT_SYSTEM
  });
  const [showSettings, setShowSettings] = useState(false);

  // Computed State
  const computed = useMemo(() => computeGameState(history, settings), [history, settings]);
  const currentSystem = SYSTEMS[settings.systemId];

  // Actions
  const handleCardInput = useCallback((rank: CardRank) => {
    const newEvent: CardEvent = {
      id: generateId(),
      rank,
      timestamp: Date.now()
    };
    setHistory(prev => [...prev, newEvent]);
  }, []);

  const handleUndo = useCallback((id: string) => {
    setHistory(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        if (last.id === id) {
            return prev.slice(0, -1);
        }
        return prev;
    });
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the current session? This cannot be undone.')) {
      setHistory([]);
    }
  }, []);

  const changeSystem = (id: string) => {
    setSettings(prev => ({ ...prev, systemId: id }));
  };
  
  const changeDecks = (count: number) => {
      setSettings(prev => ({ ...prev, decks: count }));
  };

  // Prevent accidental back navigation on mobile
  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
        if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'A') {
            // prevent double tap zoom potentially
        }
    };
    document.addEventListener('touchstart', handleTouch, {passive: false});
    return () => document.removeEventListener('touchstart', handleTouch);
  }, []);

  const lastEventId = history.length > 0 ? history[history.length - 1].id : '';
  const cardsRemaining = (settings.decks * 52) - computed.cardsSeen;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-cyan-500/30 pb-20 md:pb-0">
      
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
               <span className="font-bold text-white font-mono text-lg">S</span>
             </div>
             <h1 className="font-bold text-lg tracking-tight text-white hidden sm:block">
               StackTrace <span className="text-cyan-500 text-xs font-normal px-2 py-0.5 rounded-full bg-cyan-900/30 border border-cyan-700/50">PRO</span>
             </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 mr-4 border-r border-slate-700 pr-4">
               <ShieldCheck size={14} />
               <span>Research Mode</span>
            </div>
            <button 
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Reset Session"
            >
                <RefreshCw size={20} />
            </button>
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${showSettings ? 'text-cyan-400 bg-cyan-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                <Settings size={20} />
            </button>
          </div>
        </div>
        
        {/* Settings Dropdown */}
        {showSettings && (
            <div className="border-t border-white/10 bg-[#0f172a] animate-in slide-in-from-top-2 duration-200">
                <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Counting System</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {Object.values(SYSTEMS).map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => changeSystem(s.id)}
                                    className={`px-4 py-3 rounded-lg border text-left transition-all ${settings.systemId === s.id 
                                        ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                >
                                    <div className="font-bold text-sm">{s.name}</div>
                                    <div className="text-[10px] opacity-70 mt-1 line-clamp-2">{s.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Number of Decks</h3>
                        <div className="flex flex-wrap items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700 w-fit">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <button
                                    key={num}
                                    onClick={() => changeDecks(num)}
                                    className={`w-10 h-10 rounded-md font-mono font-bold text-sm transition-all ${settings.decks === num 
                                        ? 'bg-cyan-600 text-white shadow-lg' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-slate-500 max-w-sm">
                            Changing decks will recalculate penetration stats but keep the running count history intact.
                        </p>
                    </div>
                </div>
            </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stats & Viz */}
        <div className="lg:col-span-8 space-y-6">
            <Dashboard stats={computed} system={currentSystem} />
            
            {/* Card Input Area - Sticky on Desktop, Static on Mobile (or adjust based on preference) */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Input Stream</h2>
                        <button 
                            onClick={() => handleUndo(lastEventId)}
                            disabled={!lastEventId}
                            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <RotateCcw size={12} />
                            <span>Undo</span>
                        </button>
                    </div>
                    <span className="text-xs text-cyan-500/80 font-mono bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/50">
                        {currentSystem.name} Active
                    </span>
                </div>
                <CardInputGrid onCardInput={handleCardInput} />
                
                <CardInventory composition={computed.composition} cardsRemaining={cardsRemaining} />
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 rounded-lg bg-yellow-900/10 border border-yellow-700/20 flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-yellow-600/80 leading-relaxed">
                    <strong>Educational Use Only.</strong> This tool is for mathematical research and statistical analysis. 
                    The use of electronic devices to count cards in casinos is illegal in many jurisdictions. 
                    The developers assume no responsibility for misuse.
                </div>
            </div>
        </div>

        {/* Right Column: History Log */}
        <div className="lg:col-span-4 lg:h-auto">
            <HistoryLog 
                history={history} 
                system={currentSystem} 
                onUndo={handleUndo} 
            />
        </div>

      </main>
    </div>
  );
};

export default App;
