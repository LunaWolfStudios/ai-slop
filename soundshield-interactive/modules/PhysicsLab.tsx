import React, { useState } from 'react';
import { ScenarioType, ScenarioData, SimulationState } from '../types';
import { SCENARIOS } from '../constants';
import SoundWaveVisualizer from '../components/SoundWaveVisualizer';
import InfoModal from '../components/InfoModal';
import { Sliders, Volume2, Shield, Info, ArrowRight, MoveHorizontal, MoveVertical } from 'lucide-react';

interface Props {
  activeScenario: ScenarioType;
  setScenario: (s: ScenarioType) => void;
  onNext: () => void;
}

const PhysicsLab: React.FC<Props> = ({ activeScenario, setScenario, onNext }) => {
  const [simState, setSimState] = useState<SimulationState>({
    barrierType: 'NONE',
    height: 3,
    distance: 10,
  });
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const scenario = SCENARIOS[activeScenario];

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8 relative">
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Sidebar Controls */}
      <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1 h-full overflow-y-auto pr-2">
        
        {/* Scenario Selector */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700 backdrop-blur-md relative group">
          <div className="absolute top-4 right-4 z-10">
             <button 
                onClick={() => setIsInfoOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                title="Learn about SoundShield"
             >
               <Info className="w-5 h-5" />
             </button>
          </div>

          <label className="text-xs uppercase tracking-widest text-slate-400 mb-3 block font-display">Select Environment</label>
          <div className="relative">
            <select 
              className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none appearance-none cursor-pointer hover:bg-slate-750 transition-colors"
              value={activeScenario}
              onChange={(e) => setScenario(e.target.value as ScenarioType)}
            >
              {Object.values(SCENARIOS).map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">▼</div>
          </div>
          
          <div className="mt-4 flex items-start gap-3 bg-slate-800/50 p-3 rounded border-l-2" style={{ borderColor: scenario.color }}>
            <div className="mt-0.5"><Shield className="w-5 h-5" style={{ color: scenario.color }} /></div>
            <div>
              <h4 className="font-bold text-sm text-white">{scenario.label}</h4>
              <p className="text-xs text-slate-400 mt-1">{scenario.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {scenario.sourceDb} dB
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {scenario.frequencyLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Physics Controls */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700 backdrop-blur-md flex-1">
          <div className="flex items-center gap-2 mb-6">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-display font-bold text-white">Barrier Config</h3>
          </div>

          <div className="space-y-6">
            {/* Barrier Type Toggle */}
            <div>
              <label className="text-xs uppercase text-slate-500 mb-2 block">Technology</label>
              <div className="grid grid-cols-3 gap-2">
                {(['NONE', 'TRADITIONAL', 'SOUNDSHIELD'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSimState({ ...simState, barrierType: type })}
                    className={`px-2 py-3 rounded text-xs font-bold transition-all border ${
                      simState.barrierType === type
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {type === 'NONE' ? 'NO WALL' : type === 'TRADITIONAL' ? 'CONCRETE' : 'SOUNDSHIELD'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              {/* Distance Slider (X-Axis) */}
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="flex justify-between mb-2">
                  <label className="text-xs uppercase text-slate-400 flex items-center gap-1">
                    <MoveHorizontal className="w-3 h-3" /> Distance from Source
                  </label>
                  <span className="text-xs text-cyan-400 font-mono">{Math.round(simState.distance)}m ({Math.round(simState.distance * 3.28)}ft)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={simState.distance}
                  onChange={(e) => setSimState({ ...simState, distance: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                />
              </div>

              {/* Height Slider (Y-Axis) */}
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="flex justify-between mb-2">
                  <label className="text-xs uppercase text-slate-400 flex items-center gap-1">
                    <MoveVertical className="w-3 h-3" /> Barrier Height
                  </label>
                  <span className="text-xs text-cyan-400 font-mono">{simState.height}m</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={simState.height}
                  onChange={(e) => setSimState({ ...simState, height: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Real-time Insights */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h4 className="text-sm font-bold text-white mb-3">Acoustic Behavior</h4>
            <div className="text-sm text-slate-400 leading-relaxed min-h-[80px]">
              {simState.barrierType === 'NONE' && (
                <span className="animate-fade-in">
                  Open field. Sound waves obey the Inverse Square Law, losing 6dB per doubling of distance. No physical obstruction.
                </span>
              )}
              {simState.barrierType === 'TRADITIONAL' && (
                <span className="animate-fade-in text-red-100">
                  <strong className="text-red-400">Reflection & Diffraction:</strong> Hard surfaces bounce noise back to the source (creating new problems) while lower frequencies bend over the top edge.
                </span>
              )}
              {simState.barrierType === 'SOUNDSHIELD' && (
                <span className="animate-fade-in text-cyan-100">
                  <strong className="text-cyan-400">Absorption & Deflection:</strong> The curve creates a larger acoustic shadow. The core absorbs energy, preventing reflection, while the shape directs residual waves skyward.
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={onNext}
            className="w-full mt-8 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-sm uppercase tracking-widest transition-all hover:scale-[1.02]"
          >
            Compare Performance <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="lg:col-span-8 h-[50vh] lg:h-full order-1 lg:order-2">
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black">
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur rounded text-xs font-mono text-cyan-400 border border-cyan-500/30 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                PHYSICS ENGINE: ACTIVE
            </div>
            
            <SoundWaveVisualizer scenario={scenario} simState={simState} />
        </div>
      </div>

    </div>
  );
};

export default PhysicsLab;
