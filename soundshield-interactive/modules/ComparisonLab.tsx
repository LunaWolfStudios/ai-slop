import React, { useState } from 'react';
import { SCENARIOS } from '../constants';
import { ScenarioType } from '../types';
import {  ArrowRight, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface Props {
  activeScenario: ScenarioType;
  onNext: () => void;
}

const ComparisonLab: React.FC<Props> = ({ activeScenario, onNext }) => {
  const [viewMode, setViewMode] = useState<'VISUAL' | 'DATA'>('VISUAL');
  const scenario = SCENARIOS[activeScenario];

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Performance <span className="text-cyan-500">Comparison</span></h2>
          <p className="text-slate-400">Analyzing mitigation strategies for: <span style={{ color: scenario.color }}>{scenario.label}</span></p>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setViewMode('VISUAL')}
            className={`px-4 py-2 text-xs font-bold rounded ${viewMode === 'VISUAL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            VISUAL
          </button>
          <button 
             onClick={() => setViewMode('DATA')}
             className={`px-4 py-2 text-xs font-bold rounded ${viewMode === 'DATA' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            METRICS
          </button>
        </div>
      </div>

      {/* Split Screen Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        
        {/* Traditional Solution */}
        <div className="group relative bg-slate-900/50 rounded-2xl border border-red-900/50 p-6 flex flex-col hover:border-red-500/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 rounded-t-2xl" />
            <h3 className="text-xl font-bold text-red-100 flex items-center gap-2 mb-4">
              <XCircle className="text-red-500" /> Traditional Barrier
            </h3>
            
            <div className="flex-1 bg-black/40 rounded-xl mb-4 overflow-hidden relative">
               {/* Simplified Visual Representation */}
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-32 bg-slate-600" />
                  {/* Sound bouncing back */}
                  <div className="absolute w-12 h-12 border-l-4 border-red-500/50 rounded-full animate-ping left-[45%]"></div>
               </div>
               <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-red-400">
                  Reflective Surface = Noise Amplification
               </div>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">×</span> Heavy concrete/stone construction
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">×</span> Reflects noise back to source
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">×</span> Requires deep foundations
              </li>
              <li className="flex items-start gap-2">
                 <span className="text-red-500 font-bold">×</span> <span className="text-red-300 font-bold">{scenario.sourceDb - 5} dB</span> at receiver
              </li>
            </ul>
        </div>

        {/* SoundShield Solution */}
        <div className="group relative bg-slate-900/50 rounded-2xl border border-cyan-900/50 p-6 flex flex-col hover:border-cyan-500/50 transition-colors shadow-[0_0_30px_rgba(6,182,212,0.05)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 rounded-t-2xl shadow-[0_0_15px_cyan]" />
            <h3 className="text-xl font-bold text-cyan-100 flex items-center gap-2 mb-4">
              <CheckCircle className="text-cyan-500" /> SoundShield System
            </h3>

            <div className="flex-1 bg-black/40 rounded-xl mb-4 overflow-hidden relative">
               {/* Simplified Visual Representation */}
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-32 border-l-2 border-cyan-500 rounded-tl-[100px] bg-cyan-900/20" />
                   {/* Sound absorbed */}
                   <div className="absolute w-12 h-12 bg-cyan-500/10 rounded-full animate-ping left-[45%] opacity-50" style={{animationDuration: '2s'}}></div>
               </div>
               <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-cyan-400">
                  Curved Composite = Absorption & Redirection
               </div>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">✓</span> Lightweight composite honeycomb
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">✓</span> Absorbs 95% of spectral energy
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">✓</span> Rapid modular installation
              </li>
              <li className="flex items-start gap-2">
                 <span className="text-cyan-500 font-bold">✓</span> <span className="text-green-400 font-bold text-lg">{scenario.sourceDb - 22} dB</span> at receiver
              </li>
            </ul>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-lg shadow-cyan-900/20 transition-all hover:translate-x-1"
          >
            View Cost Analysis <BarChart3 className="w-5 h-5" />
          </button>
      </div>
    </div>
  );
};

export default ComparisonLab;