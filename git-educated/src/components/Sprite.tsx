import React from 'react';
import { motion } from 'motion/react';

export const Sprite: React.FC<{ message: string; emotion?: 'happy' | 'neutral' | 'confused' }> = ({ message, emotion = 'neutral' }) => {
  return (
    <div className="absolute bottom-8 right-8 flex items-end gap-4 z-20 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-green-500/30 p-4 rounded-xl max-w-xs shadow-lg backdrop-blur-md relative"
      >
        <div className="text-sm text-green-300 font-mono typing-effect">
          {message}
        </div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-zinc-900 border-r border-b border-green-500/30 rotate-45 transform translate-y-1/2 translate-x-1/2"></div>
      </motion.div>
      
      <div className="w-24 h-24 bg-green-900/20 rounded-full border-2 border-green-500/50 flex items-center justify-center overflow-hidden backdrop-blur-sm relative">
        {/* Placeholder for Sprite Image */}
        <div className={`w-16 h-16 bg-green-500/80 mask-image-gradient ${emotion === 'happy' ? 'animate-bounce' : ''}`}></div>
        <div className="absolute inset-0 bg-scanlines opacity-30"></div>
      </div>
    </div>
  );
};
