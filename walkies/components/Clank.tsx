
import React from 'react';
import { motion } from 'framer-motion';
import { Dog } from 'lucide-react';

interface ClankProps {
  mood: 'excited' | 'chill' | 'sniffing' | 'tired' | 'barking';
  isWalking: boolean;
}

const Clank: React.FC<ClankProps> = ({ mood, isWalking }) => {
  const animations = {
    excited: { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] },
    chill: { scale: [1, 1.02, 1], y: [0, -2, 0] },
    sniffing: { x: [-5, 5, -5], rotate: [10, 15, 10] },
    tired: { scale: [1, 0.95, 1], opacity: 0.8 },
    barking: { scale: [1, 1.1, 1], rotate: [0, -10, 0] },
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        animate={isWalking ? { y: [0, -10, 0] } : animations[mood]}
        transition={{ 
          repeat: Infinity, 
          duration: isWalking ? 0.4 : 2, 
          ease: "easeInOut" 
        }}
        className="text-amber-700"
      >
        <Dog size={64} strokeWidth={1.5} fill="#D97706" fillOpacity={0.2} />
      </motion.div>
      <div className="mt-2 text-xs font-medium text-amber-900/60 uppercase tracking-widest">
        Clank
      </div>
      {isWalking && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute -right-4 top-0 text-amber-500"
        >
          🐾
        </motion.div>
      )}
    </div>
  );
};

export default Clank;
