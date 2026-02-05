import React from 'react';
import { PlayCircle } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const Intro: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background Video Placeholder / Abstract Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black z-0"></div>
      
      {/* Animated Rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-[600px] h-[600px] border border-cyan-500/30 rounded-full animate-spin-slow"></div>
        <div className="absolute w-[400px] h-[400px] border border-purple-500/30 rounded-full animate-pulse"></div>
        <div className="absolute w-[800px] h-[800px] border border-blue-500/20 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
      </div>

      <div className="z-10 text-center px-4">
        <h2 className="text-cyan-400 tracking-[0.5em] text-sm md:text-base font-display mb-4 uppercase animate-fade-in-up">
          Interactive Demonstration
        </h2>
        <h1 className="text-5xl md:text-8xl font-black font-display text-white mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          SOUND<span className="text-cyan-500">SHIELD</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-2xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          The next generation of curved composite noise barrier technology. 
          <br/>
          <span className="text-white font-medium">Silence the noise. Amplify the future.</span>
        </p>

        <button 
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xl rounded-none clip-path-polygon transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <PlayCircle className="w-6 h-6 group-hover:animate-pulse" />
          ENTER SIMULATION
        </button>
      </div>

      <div className="absolute bottom-10 text-slate-600 text-xs tracking-widest uppercase">
        v2.4.0 // System Ready
      </div>
    </div>
  );
};

export default Intro;
