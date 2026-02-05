import React, { useState } from 'react';
import GameEngine from './components/GameEngine';
import { Play } from 'lucide-react';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-900 text-white overflow-hidden relative">
        {/* Animated Background Placeholder */}
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover opacity-20"></div>
        
        <div className="z-10 text-center max-w-2xl px-4">
          <h1 className="text-8xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
            4 TOWERS
          </h1>
          <h2 className="text-2xl text-purple-200 mb-8 font-light tracking-widest">NERDSTORM'S REALM</h2>
          
          <p className="text-gray-400 mb-8 leading-relaxed">
            Trapped in an isometric dimension. Master the 4 elements. 
            Socket polyomino spells into your staff. 
            Defeat the procedural horrors.
          </p>

          <button 
            onClick={() => setStarted(true)}
            className="group relative px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded font-bold text-xl transition-all hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="flex items-center gap-2 relative z-10">
              <Play fill="currentColor" /> ENTER THE TOWER
            </span>
          </button>
          
          <div className="mt-8 text-xs text-gray-500">
            Powered by React, Tailwind & Gemini API (for Taunts)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden select-none">
      <GameEngine />
    </div>
  );
};

export default App;