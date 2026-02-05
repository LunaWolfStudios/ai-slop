import React from 'react';
import { ModuleType, ScenarioType } from '../types';
import { SCENARIOS } from '../constants';
import { Activity, Shield, Battery, Grid } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  activeModule: ModuleType;
  activeScenario: ScenarioType;
  setModule: (m: ModuleType) => void;
}

const Layout: React.FC<Props> = ({ children, activeModule, activeScenario, setModule }) => {
  if (activeModule === ModuleType.INTRO) return <>{children}</>;

  const scenarioColor = SCENARIOS[activeScenario].color;

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-white overflow-hidden flex flex-col font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-900/80 to-transparent" />
         <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />
         {/* Scanlines */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      </div>

      {/* Top HUD */}
      <header className="relative z-50 h-16 flex items-center justify-between px-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-500" />
          <span className="font-display font-bold text-lg tracking-widest">SOUND<span className="text-cyan-500">SHIELD</span></span>
        </div>

        {/* Module Navigation Steps */}
        <div className="hidden md:flex items-center gap-2">
           {[ModuleType.PHYSICS, ModuleType.COMPARISON, ModuleType.DASHBOARD, ModuleType.EXPLORER].map((mod, idx) => (
             <React.Fragment key={mod}>
                <button
                    onClick={() => setModule(mod)} 
                    className={`px-4 py-1 text-xs font-bold rounded uppercase transition-all ${
                        activeModule === mod 
                        ? 'bg-white/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] border border-cyan-500/30' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    {mod}
                </button>
                {idx < 3 && <div className="w-8 h-[1px] bg-slate-700" />}
             </React.Fragment>
           ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-cyan-500/80">
          <div className="flex items-center gap-1">
             <Activity className="w-4 h-4" />
             <span className="animate-pulse">ONLINE</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className="w-4 h-4" />
            100%
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-40 flex-1 overflow-hidden">
        {children}
      </main>

      {/* Bottom Status Bar */}
      <footer className="relative z-50 h-10 border-t border-white/10 bg-slate-900 flex items-center justify-between px-6 text-[10px] uppercase tracking-wider text-slate-500">
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: scenarioColor }}></span>
            ACTIVE PROTOCOL: <span className="text-white">{SCENARIOS[activeScenario].label}</span>
         </div>
         <div className="flex items-center gap-4">
            <span>Lat: 34.0522 N</span>
            <span>Lng: 118.2437 W</span>
            <span>Sys: Nominal</span>
         </div>
      </footer>
    </div>
  );
};

export default Layout;