import React from 'react';
import { SCENARIOS } from '../constants';
import { ScenarioType } from '../types';
import * as Icons from 'lucide-react';
import { Globe, ArrowLeft } from 'lucide-react';

interface Props {
  setScenario: (s: ScenarioType) => void;
  goToPhysics: () => void;
  onReset: () => void;
}

const ApplicationsExplorer: React.FC<Props> = ({ setScenario, goToPhysics, onReset }) => {
  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col overflow-y-auto">
       <div className="mb-8 text-center">
          <Globe className="w-12 h-12 text-cyan-500 mx-auto mb-4 animate-spin-slow" />
          <h2 className="text-4xl font-display font-bold text-white mb-2">Global <span className="text-cyan-500">Applications</span></h2>
          <p className="text-slate-400 max-w-xl mx-auto">One technology. Infinite solutions. Explore how SoundShield adapts to every noise challenge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {Object.values(SCENARIOS).map((scenario) => {
                // Dynamic Icon component
                // @ts-ignore
                const IconComponent = Icons[scenario.icon] || Icons.HelpCircle;

                return (
                    <button
                        key={scenario.id}
                        onClick={() => {
                            setScenario(scenario.id);
                            goToPhysics();
                        }}
                        className="group relative h-64 bg-slate-800/40 rounded-2xl border border-slate-700 p-6 flex flex-col items-center justify-center hover:bg-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300"
                    >
                         <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3"
                            style={{ backgroundColor: `${scenario.color}22` }}
                         >
                             <IconComponent className="w-8 h-8" style={{ color: scenario.color }} />
                         </div>
                         <h3 className="text-xl font-bold text-white mb-2">{scenario.label}</h3>
                         <p className="text-xs text-slate-400 text-center line-clamp-2">{scenario.problem}</p>
                         
                         <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 text-xs font-bold uppercase tracking-widest">
                            Run Simulation
                         </div>
                    </button>
                );
            })}
        </div>

        <div className="mt-auto flex justify-center pb-8">
            <button 
                onClick={onReset}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Return to Title
            </button>
        </div>
    </div>
  );
};

export default ApplicationsExplorer;
