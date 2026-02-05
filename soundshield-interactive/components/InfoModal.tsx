import React, { useState } from 'react';
import { X, Shield, Layers, TrendingUp, Cpu } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'SCIENCE' | 'MATERIAL' | 'IMPACT'>('SCIENCE');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h2 className="text-2xl font-display font-bold text-white tracking-wider">SOUND<span className="text-cyan-400">SHIELD</span> TECHNOLOGY</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button 
            onClick={() => setActiveTab('SCIENCE')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'SCIENCE' ? 'bg-cyan-900/20 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4" /> The Science
          </button>
          <button 
            onClick={() => setActiveTab('MATERIAL')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'MATERIAL' ? 'bg-cyan-900/20 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" /> Composite Core
          </button>
          <button 
            onClick={() => setActiveTab('IMPACT')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'IMPACT' ? 'bg-cyan-900/20 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Real World Impact
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
          {activeTab === 'SCIENCE' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex gap-6 items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-4">Diffraction vs. Deflection</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Traditional flat barriers rely on <span className="text-red-400">reflection</span>, which bounces noise back into the environment, or simple blocking, which allows low-frequency waves to <span className="text-red-400">diffract</span> (bend) over the top edge.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    SoundShield uses a <span className="text-cyan-400">parabolic curvature</span> to catch sound waves and direct them vertically upward, away from receivers on both sides of the wall. This effectively creates a "shadow zone" that is 30% larger than a vertical wall of the same height.
                  </p>
                </div>
                <div className="w-1/3 bg-black/40 rounded-xl border border-white/10 p-4">
                   <div className="text-xs text-center text-slate-500 mb-2">ACOUSTIC SHADOW COMPARISON</div>
                   <div className="h-32 relative">
                      {/* Diagram Placeholder */}
                      <div className="absolute bottom-0 left-2 w-1 h-16 bg-red-500"></div>
                      <div className="absolute bottom-16 left-2 w-20 h-0.5 bg-red-500/20 rotate-12 origin-left"></div>
                      
                      <div className="absolute bottom-0 right-12 w-4 h-16 border-l border-cyan-500 rounded-tl-full"></div>
                      <div className="absolute bottom-16 right-12 w-20 h-0.5 bg-cyan-500/20 -rotate-45 origin-left"></div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MATERIAL' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4">Advanced Honeycomb Matrix</h3>
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <p className="text-slate-400 leading-relaxed mb-4">
                      At the heart of every SoundShield panel is a proprietary <span className="text-cyan-400">aerospace-grade honeycomb core</span>. This structure traps acoustic energy within thousands of hexagonal cells, dissipating it as minute amounts of heat rather than letting it pass through.
                    </p>
                    <ul className="space-y-3 mt-4">
                      <li className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" /> Lightweight (1/5th weight of concrete)
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" /> Hydrophobic & UV Resistant
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" /> Class A Fire Rating
                      </li>
                    </ul>
                 </div>
                 <div className="bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-slate-800 rounded-xl border border-white/10 p-6 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/10"></div>
                    <div className="grid grid-cols-4 gap-1 opacity-40 transform rotate-12 scale-150">
                       {Array.from({length: 16}).map((_,i) => (
                         <div key={i} className="w-8 h-8 border border-cyan-400 skew-x-12"></div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'IMPACT' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-6 rounded-xl text-center">
                  <div className="text-4xl font-bold text-white mb-2">-22dB</div>
                  <div className="text-xs text-slate-400 uppercase">Average Reduction</div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl text-center">
                  <div className="text-4xl font-bold text-white mb-2">40%</div>
                  <div className="text-xs text-slate-400 uppercase">Cost Savings</div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl text-center">
                  <div className="text-4xl font-bold text-white mb-2">100+</div>
                  <div className="text-xs text-slate-400 uppercase">Projects Deployed</div>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-center max-w-2xl mx-auto">
                SoundShield isn't just a wall; it's a quality of life improvement. By effectively mitigating noise pollution, we increase property values, reduce health risks associated with chronic noise exposure, and allow industries to operate closer to residential areas without friction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
