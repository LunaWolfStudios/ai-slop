import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../hooks/useGame';
import { RotateCcw } from 'lucide-react';

export const LessonPanel: React.FC<{ title: string; objective: string; progress: number; solution?: string; story?: string }> = ({ title, objective, progress, solution, story }) => {
  const { resetChapter } = useGame();

  return (
    <div className="w-full md:w-80 bg-zinc-900 p-6 flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xs text-green-600 uppercase tracking-widest mb-2">Current Lesson</h2>
          <h1 className="text-xl font-bold text-green-400 glow-text">{title}</h1>
        </div>
        <button 
          onClick={resetChapter}
          className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-green-400 transition-colors"
          title="Reset Chapter"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      
      {story && (
        <div className="text-zinc-400 text-sm italic border-l-2 border-green-500/30 pl-3">
          {story}
        </div>
      )}

      <div className="flex-1">
        <div className="text-sm text-zinc-400 mb-4">
          Objective:
        </div>
        <div className="bg-zinc-950/50 p-4 rounded border border-green-900/30 text-green-200 font-mono text-sm mb-4">
          {objective}
        </div>

        {solution && (
          <details className="group">
            <summary className="cursor-pointer text-xs text-zinc-500 hover:text-green-400 transition-colors list-none flex items-center gap-2">
              <span className="transform group-open:rotate-90 transition-transform">▶</span>
              Show Answer
            </summary>
            <div className="mt-2 bg-zinc-950/80 p-3 rounded border border-green-900/20 text-zinc-400 font-mono text-xs whitespace-pre-wrap">
              {solution}
            </div>
          </details>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
