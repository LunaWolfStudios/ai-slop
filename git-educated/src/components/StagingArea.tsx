import React from 'react';
import { useGame } from '../hooks/useGame';
import { motion } from 'motion/react';

export const StagingArea: React.FC = () => {
  const { gameState } = useGame();
  const { workingDirectory, staging } = gameState.repo;

  // Files in working directory but NOT in staging are "Unstaged"
  const unstaged = workingDirectory.filter(f => !staging.includes(f));
  
  // Files in staging are "Staged"
  const staged = staging;

  return (
    <div className="bg-zinc-900 border-l border-green-900/30 p-4 flex flex-col gap-4 min-w-[200px] overflow-y-auto">
      <div>
        <h3 className="text-xs text-green-600 uppercase tracking-widest mb-2">Staged Changes</h3>
        <div className="space-y-1">
          {staged.length === 0 && <div className="text-zinc-600 text-xs italic">Empty</div>}
          {staged.map(file => (
            <motion.div 
              key={file}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-green-400 text-sm font-mono flex items-center gap-2"
            >
              <span>+</span> {file}
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs text-red-600 uppercase tracking-widest mb-2">Unstaged Changes</h3>
        <div className="space-y-1">
          {unstaged.length === 0 && <div className="text-zinc-600 text-xs italic">Clean</div>}
          {unstaged.map(file => (
            <motion.div 
              key={file}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-400 text-sm font-mono flex items-center gap-2"
            >
              <span>?</span> {file}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
