import React from 'react';
import { GamePhase } from '../types';
import { Play, RotateCcw, Trophy } from 'lucide-react';

interface GameOverlayProps {
  phase: GamePhase;
  score: number;
  onStart: () => void;
  onRestart: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ phase, score, onStart, onRestart }) => {
  if (phase === GamePhase.BUILD || phase === GamePhase.RUN) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-cyan-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] max-w-md w-full text-center">
        
        {phase === GamePhase.MENU && (
          <>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
              NEON MAZE
            </h1>
            <p className="text-slate-400 mb-8">
              Build walls. Extend the path. Delay the runner.
            </p>
            <div className="space-y-4">
               <div className="bg-slate-800/50 p-4 rounded-lg text-sm text-slate-300 text-left">
                  <p className="mb-2"><strong className="text-cyan-400">Mission:</strong> Make the monster take as long as possible to reach the exit.</p>
                  <ul className="list-disc pl-4 space-y-1">
                      <li>You have <span className="text-yellow-400">30s</span> to build.</li>
                      <li>Resources are limited.</li>
                      <li>Don't block the path completely!</li>
                  </ul>
               </div>
               <button
                onClick={onStart}
                className="w-full group relative px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                   <Play className="w-5 h-5 fill-current" /> START GAME
                </span>
                <div className="absolute inset-0 rounded-lg bg-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </>
        )}

        {phase === GamePhase.RESULT && (
          <>
            <div className="mb-6 flex justify-center">
                <Trophy className="w-16 h-16 text-yellow-400 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Run Complete</h2>
            <div className="text-6xl font-bold digit-font text-cyan-400 mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              {score.toFixed(1)}s
            </div>
            <p className="text-slate-400 mb-8">Time taken for the monster to reach the exit.</p>
            
            <button
              onClick={onRestart}
              className="w-full px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> PLAY AGAIN
            </button>
          </>
        )}
      </div>
    </div>
  );
};
