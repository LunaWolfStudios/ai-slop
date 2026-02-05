import React from 'react';

interface EndGameModalProps {
  onPrestige: () => void;
  onContinue: () => void;
}

const EndGameModal: React.FC<EndGameModalProps> = ({ onPrestige, onContinue }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-purple-500 rounded-2xl max-w-2xl w-full p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.5)]">
        <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
          SINGULARITY ACHIEVED
        </h1>
        <p className="text-xl text-gray-300 mb-8 font-mono leading-relaxed">
          You have successfully connected the entire planet. Every human, cow, and smart-fridge is now part of the SpaceMob.
          <br /><br />
          The Earth is complete. But the signal must go further.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={onContinue}
            className="px-6 py-4 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors font-bold"
          >
            Stay on Earth (Continue)
          </button>
          <button 
            onClick={onPrestige}
            className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
          >
            🚀 Go To Mars (Prestige)
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500 italic">
          Prestige resets buildings but keeps permanent multipliers (Coming Soon)
        </p>
      </div>
    </div>
  );
};

export default EndGameModal;