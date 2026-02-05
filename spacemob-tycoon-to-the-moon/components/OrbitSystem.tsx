import React, { useMemo } from 'react';
import { BUILDINGS } from '../constants';

interface OrbitSystemProps {
  buildings: Record<number, number>;
}

const OrbitSystem: React.FC<OrbitSystemProps> = ({ buildings }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {/* Central Glow (Static) */}
      <div className="absolute w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl"></div>
      
      {BUILDINGS.map(b => {
          const count = buildings[b.id] || 0;
          if (count === 0) return null;
          
          // STRICT 1:1 Rendering (capped at 150 for performance)
          const visualCount = Math.min(count, 150);
          
          const orbitDuration = Math.max(20, 100 - (b.id * 5)); 
          const radius = 140 + (b.id * 24); // Spaced out rings

          return (
             <div 
               key={`ring-container-${b.id}`}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
               style={{
                 width: `${radius * 2}px`,
                 height: `${radius * 2}px`,
                 animation: `spin-ring ${orbitDuration}s linear infinite`
               }}
             >
                {Array.from({ length: visualCount }).map((_, i) => {
                   const angle = (360 / visualCount) * i;
                   
                   // --- VISUAL CONFIGURATION ---
                   let bgColor = '#fff';
                   let sizePx = 8;
                   let gridColor = 'rgba(255,255,255,0.5)';
                   let gridSize = '33%';
                   let boxShadow = 'none';
                   let borderColor = 'rgba(255,255,255,0.3)';
                   let borderDesc = '1px solid';

                   if (b.tier === 'prototype') { 
                     // ORANGE / BRONZE
                     bgColor = '#d97706'; 
                     sizePx = 10; 
                     gridColor='rgba(0,0,0,0.3)'; 
                     borderColor = '#78350f';
                   } else if (b.tier === 'block1') { 
                     // BLUE
                     bgColor = '#3b82f6'; 
                     sizePx = 14; 
                     gridColor='rgba(255,255,255,0.3)'; 
                     gridSize='25%'; 
                     boxShadow = '0 0 4px rgba(59, 130, 246, 0.6)';
                     borderColor = '#93c5fd';
                   } else if (b.tier === 'block2') { 
                     // GOLD / ASIC
                     bgColor = '#eab308'; 
                     sizePx = 18; 
                     gridColor='rgba(0,0,0,0.4)'; 
                     gridSize='20%'; 
                     boxShadow = '0 0 8px rgba(234, 179, 8, 0.6)';
                     borderColor = '#fef08a';
                   } else if (b.tier === 'commercial') { 
                     // PURPLE / NEON
                     bgColor = '#a855f7'; 
                     sizePx = 24; 
                     gridColor='rgba(255,255,255,0.4)'; 
                     gridSize='15%'; 
                     boxShadow = '0 0 12px rgba(168, 85, 247, 0.7)';
                     borderColor = '#d8b4fe';
                   } else { 
                     // CYAN / DIAMOND
                     bgColor = '#06b6d4'; 
                     sizePx = 30; 
                     gridColor='rgba(255,255,255,0.8)'; 
                     gridSize='10%'; 
                     boxShadow = '0 0 20px rgba(6, 182, 212, 0.8)';
                     borderColor = '#fff';
                     borderDesc = '2px solid';
                   }

                   return (
                     <div
                        key={i}
                        className="absolute top-1/2 left-1/2"
                        style={{
                           width: 0,
                           height: 0,
                           transform: `rotate(${angle}deg) translateY(-${radius}px)`, 
                        }}
                     >
                        {/* The Satellite Waffle Itself */}
                        <div 
                           className="rounded-[2px]"
                           style={{
                              width: `${sizePx}px`,
                              height: `${sizePx}px`,
                              transform: 'translate(-50%, -50%)', // Center on the point
                              backgroundColor: bgColor,
                              backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
                              backgroundSize: `${gridSize} ${gridSize}`,
                              border: `${borderDesc} ${borderColor}`,
                              boxShadow: boxShadow,
                              animation: 'self-spin 20s linear infinite' 
                           }}
                        />
                     </div>
                   )
                })}
             </div>
          )
      })}
      
      <style>{`
        @keyframes spin-ring {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes self-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OrbitSystem;