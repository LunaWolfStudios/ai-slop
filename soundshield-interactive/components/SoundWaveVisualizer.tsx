import React, { useEffect, useState, useRef } from 'react';
import { SimulationState, ScenarioData } from '../types';

interface Props {
  scenario: ScenarioData;
  simState: SimulationState;
}

const SoundWaveVisualizer: React.FC<Props> = ({ scenario, simState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ticks, setTicks] = useState(0);

  // Constants for positioning (percentages)
  const SOURCE_X = 10;
  const RECEIVER_X = 90;
  
  // Convert meters to percentage for visualizer (Mapping 0-50m to 10-80%)
  // Source is at 0m effectively. Receiver is at 50m.
  const MAX_DIST_M = 50;
  const barrierPercent = SOURCE_X + (simState.distance / MAX_DIST_M) * (RECEIVER_X - SOURCE_X);

  const isCurved = simState.barrierType === 'SOUNDSHIELD';
  const isTraditional = simState.barrierType === 'TRADITIONAL';
  const hasBarrier = simState.barrierType !== 'NONE';

  // Animation Loop for distinct wave spawning
  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1);
    }, 2000); // Spawn new wave group every 2s
    return () => clearInterval(interval);
  }, []);

  // Generate waves
  const waveGroups = [0, 1, 2]; // 3 active groups at any time

  const barrierColor = hasBarrier 
    ? (isCurved ? scenario.color : '#ef4444') 
    : 'transparent';

  // Calculate dB at receiver
  let displayedDb = scenario.sourceDb - 10; // Base distance loss
  if (hasBarrier) {
      if (isCurved) displayedDb -= 25; // SoundShield Reduction
      else displayedDb -= 12; // Traditional Reduction
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black/40 rounded-xl border border-white/10 backdrop-blur-sm shadow-inner">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(${scenario.color}33 1px, transparent 1px), linear-gradient(90deg, ${scenario.color}33 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Measurements Overlay */}
      <div className="absolute bottom-4 left-0 w-full px-8 flex justify-between text-[10px] font-mono text-slate-500 pointer-events-none z-10">
          <span>0m</span>
          <span>10m</span>
          <span>20m</span>
          <span>30m</span>
          <span>40m</span>
          <span>50m</span>
      </div>
      <div className="absolute bottom-8 left-[10%] right-[10%] h-px bg-white/10 z-0"></div>

      {/* Source Icon & Emitter */}
      <div className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-all duration-300" style={{ left: `${SOURCE_X}%` }}>
        <div className="w-6 h-6 rounded-full bg-white animate-pulse mb-2 shadow-[0_0_20px_white] flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full" />
        </div>
        <div className="text-sm font-bold bg-black/50 px-2 rounded backdrop-blur" style={{ color: scenario.color }}>{scenario.sourceDb} dB</div>
      </div>

      {/* The Receiver (House/Person) */}
      <div className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-all duration-300" style={{ left: `${RECEIVER_X}%` }}>
        <div className={`w-10 h-10 rounded border-2 flex items-center justify-center bg-black/80 transition-colors duration-500 ${hasBarrier ? 'border-green-500/50' : 'border-red-500/50'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div className={`text-xl font-bold font-mono mt-2 transition-colors duration-500 bg-black/50 px-2 rounded backdrop-blur ${
          !hasBarrier ? 'text-red-500' : isCurved ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {displayedDb.toFixed(1)} dB
        </div>
      </div>

      {/* The Barrier */}
      {hasBarrier && (
        <div 
          className="absolute bottom-[20%] z-30 transition-all duration-300 ease-out flex flex-col items-center group"
          style={{
            left: `${barrierPercent}%`,
            height: `${simState.height * 12}%`, // Height scaling
            width: '12px',
            transform: 'translateX(-50%)'
          }}
        >
            <div className="text-[10px] bg-black/80 px-1 rounded text-white mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isCurved ? 'SoundShield' : 'Concrete'} ({simState.distance}m)
            </div>

            <div 
                className="w-full h-full relative"
                style={{
                    backgroundColor: isCurved ? '#1e293b' : '#525252',
                    borderColor: barrierColor,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderTopLeftRadius: isCurved ? '100px' : '2px',
                    borderTopRightRadius: isCurved ? '0px' : '2px',
                    boxShadow: `0 0 20px ${barrierColor}66`
                }}
            >
                {/* Internal Texture */}
                <div className="absolute inset-0 opacity-50 overflow-hidden">
                    {isCurved ? (
                        <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-60"></div>
                    ) : (
                        <div className="w-full h-full bg-stone-500/20"></div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Waves System */}
      {/* We render distinct waves for Source, Reflection, Leakage, and Deflection */}
      {waveGroups.map((groupId) => (
        <React.Fragment key={groupId}>
            {/* 1. Main Source Waves */}
            <div
                className="absolute top-1/2 -translate-y-1/2 rounded-full border-2 box-border pointer-events-none"
                style={{
                    left: `${SOURCE_X}%`,
                    borderColor: scenario.color,
                    animation: `expandWave 4s linear infinite`,
                    animationDelay: `${groupId * 1.3}s`,
                    opacity: 0
                }}
            />

            {/* Interaction Waves (Only if Barrier exists) */}
            {hasBarrier && (
                <>
                    {/* 2. Reflection (Concrete Only) - Bounces Back Left */}
                    {isTraditional && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-red-500/50 box-border pointer-events-none"
                            style={{
                                left: `${barrierPercent}%`,
                                animation: `reflectWave 3s ease-out infinite`,
                                animationDelay: `${groupId * 1.3 + 1}s`, // Delay to sync with arrival
                                opacity: 0
                            }}
                        />
                    )}

                    {/* 3. Deflection (SoundShield Only) - Goes Up */}
                    {isCurved && (
                        <div
                            className="absolute rounded-full border-t-4 border-cyan-400 box-border pointer-events-none"
                            style={{
                                left: `${barrierPercent}%`,
                                bottom: `${20 + (simState.height * 12)}%`, // Start at top of wall
                                transform: 'translateX(-50%)',
                                width: '20px',
                                height: '20px',
                                animation: `deflectWaveUp 2.5s ease-out infinite`,
                                animationDelay: `${groupId * 1.3 + 1}s`,
                                opacity: 0
                            }}
                        />
                    )}

                    {/* 4. Leakage/Diffraction (Concrete Only) - Continues Right but Fades */}
                    {isTraditional && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 rounded-full border-r-2 border-red-500/30 box-border pointer-events-none"
                            style={{
                                left: `${barrierPercent}%`,
                                animation: `leakWave 3s linear infinite`,
                                animationDelay: `${groupId * 1.3 + 1.1}s`,
                                opacity: 0
                            }}
                        />
                    )}
                     
                    {/* 5. Minimal Leakage (SoundShield) - Very faint */}
                    {isCurved && (
                         <div
                            className="absolute top-1/2 -translate-y-1/2 rounded-full border-r-2 border-cyan-500/10 box-border pointer-events-none"
                            style={{
                                left: `${barrierPercent}%`,
                                animation: `leakWave 3s linear infinite`,
                                animationDelay: `${groupId * 1.3 + 1.1}s`,
                                opacity: 0
                            }}
                        />
                    )}
                </>
            )}
        </React.Fragment>
      ))}

      <style>{`
        @keyframes expandWave {
          0% { width: 0px; height: 0px; opacity: 1; border-width: 4px; }
          60% { opacity: ${hasBarrier ? 0.8 : 0.6}; } /* Hit barrier approx here visually */
          100% { width: 1200px; height: 1200px; opacity: 0; border-width: 0px; }
        }

        @keyframes reflectWave {
            0% { width: 10px; height: 10px; opacity: 0.8; border-right-color: transparent; border-top-color: transparent; border-bottom-color: transparent; transform: translate(-50%, -50%) scale(1); }
            100% { width: 400px; height: 400px; opacity: 0; transform: translate(-100%, -50%) scale(1.5); }
        }

        @keyframes deflectWaveUp {
            0% { width: 20px; height: 10px; opacity: 1; border-color: ${scenario.color}; transform: translateX(-50%) translateY(0); }
            100% { width: 300px; height: 200px; opacity: 0; border-color: ${scenario.color}; transform: translateX(-50%) translateY(-300px); }
        }

        @keyframes leakWave {
            0% { width: 10px; height: 10px; opacity: 0.5; border-left-color: transparent; }
            100% { width: 600px; height: 600px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SoundWaveVisualizer;
