import React, { useState } from 'react';
import { BuildingDef, UpgradeDef } from '../types';

interface TechTreeProps {
  buildings: BuildingDef[];
  upgrades: UpgradeDef[];
  ownedBuildings: Record<number, number>;
  ownedUpgrades: string[];
  currentCp: number;
  currentHype: number;
  currentSubscribers: number;
  onBuyBuilding: (b: BuildingDef) => void;
  onBuyUpgrade: (uId: string, cost: number, currency: 'CP' | 'HYPE') => void;
}

const formatNumber = (num: number) => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
  return Math.floor(num).toLocaleString();
};

const TechTree: React.FC<TechTreeProps> = ({
  buildings,
  upgrades,
  ownedBuildings,
  ownedUpgrades,
  currentCp,
  currentHype,
  currentSubscribers,
  onBuyBuilding,
  onBuyUpgrade,
}) => {
  
  const [activeTab, setActiveTab] = useState<'BUILD' | 'HARDWARE' | 'SOFTWARE' | 'MARKET'>('BUILD');

  // Filter upgrades by category
  const hardwareUpgrades = upgrades.filter(u => u.category === 'HARDWARE');
  const softwareUpgrades = upgrades.filter(u => u.category === 'SOFTWARE');
  const marketUpgrades = upgrades.filter(u => u.category === 'MARKET');

  const renderUpgradeList = (list: UpgradeDef[]) => (
    <div className="space-y-3">
      {list.map(u => {
          const isOwned = ownedUpgrades.includes(u.id);
          const currentCurrency = u.currency === 'HYPE' ? currentHype : currentCp;
          const canAfford = currentCurrency >= u.cost;
          if (isOwned) return null; 
          
          const currencyLabel = u.currency === 'HYPE' ? 'H' : 'CP';
          const currencyColor = u.currency === 'HYPE' ? 'text-yellow-400' : 'text-blue-400';
          const borderColor = u.currency === 'HYPE' ? 'border-yellow-600' : 'border-blue-600';

          return (
          <button
            key={u.id}
            onClick={() => onBuyUpgrade(u.id, u.cost, u.currency)}
            disabled={!canAfford}
            className={`w-full text-left p-3 rounded border flex flex-col transition-all relative group
              ${canAfford 
                ? `${borderColor} bg-gray-800 hover:bg-gray-700` 
                : 'border-gray-700 bg-gray-900 opacity-60 cursor-not-allowed'}`}
          >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-yellow-200 text-sm group-hover:text-white transition-colors">{u.name}</span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded bg-black/40 ${currencyColor}`}>
                    {formatNumber(u.cost)} {currencyLabel}
                </span>
              </div>
              <p className="text-xs text-gray-400">{u.description}</p>
              <p className="text-[10px] text-gray-500 italic mt-1 border-t border-white/5 pt-1">"{u.flavor}"</p>
          </button>
          );
      })}
      {list.every(u => ownedUpgrades.includes(u.id)) && (
        <div className="text-center text-gray-500 py-8 italic">All tech in this branch researched!</div>
      )}
    </div>
  );

  return (
    <div className="w-full md:w-[420px] bg-[#0f172a]/95 border-l border-white/10 flex flex-col z-20 h-full backdrop-blur-lg shadow-2xl">
      <div className="p-4 border-b border-white/10 bg-[#1e293b] flex justify-between items-center">
        <h2 className="font-orbitron text-lg text-white flex items-center gap-2">
           SpaceMob HQ
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-[#0f172a]">
        <button onClick={() => setActiveTab('BUILD')} className={`flex-1 py-3 text-xs font-bold tracking-wider hover:bg-white/5 ${activeTab === 'BUILD' ? 'text-blue-400 border-b-2 border-blue-400 bg-white/5' : 'text-gray-500'}`}>SATs</button>
        <button onClick={() => setActiveTab('HARDWARE')} className={`flex-1 py-3 text-xs font-bold tracking-wider hover:bg-white/5 ${activeTab === 'HARDWARE' ? 'text-yellow-400 border-b-2 border-yellow-400 bg-white/5' : 'text-gray-500'}`}>H/W</button>
        <button onClick={() => setActiveTab('SOFTWARE')} className={`flex-1 py-3 text-xs font-bold tracking-wider hover:bg-white/5 ${activeTab === 'SOFTWARE' ? 'text-purple-400 border-b-2 border-purple-400 bg-white/5' : 'text-gray-500'}`}>S/W</button>
        <button onClick={() => setActiveTab('MARKET')} className={`flex-1 py-3 text-xs font-bold tracking-wider hover:bg-white/5 ${activeTab === 'MARKET' ? 'text-green-400 border-b-2 border-green-400 bg-white/5' : 'text-gray-500'}`}>MKT</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative custom-scrollbar pb-24">
        
        {activeTab === 'BUILD' && (
           <div className="space-y-4">
            {buildings.map((b, index) => {
              const count = ownedBuildings[b.id] || 0;
              const cost = Math.floor(b.baseCost * Math.pow(1.15, count));
              const canAfford = currentCp >= cost;
              
              // Check Unlock Status
              let isLocked = false;
              let lockReason = "";

              if (b.reqBuildingId !== undefined) {
                const reqCount = ownedBuildings[b.reqBuildingId] || 0;
                if (reqCount === 0) {
                  isLocked = true;
                  lockReason = `Requires ${buildings.find(p => p.id === b.reqBuildingId)?.name}`;
                }
              }
              
              if (!isLocked && b.reqSubscribers && currentSubscribers < b.reqSubscribers) {
                isLocked = true;
                lockReason = `Need ${formatNumber(b.reqSubscribers)} Subs`;
              }

              return (
                <div key={b.id} className="relative">
                   <button 
                     onClick={() => !isLocked && onBuyBuilding(b)}
                     disabled={isLocked || !canAfford}
                     className={`w-full relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-300
                       ${isLocked 
                         ? 'border-gray-800 bg-gray-900/50 grayscale opacity-60' 
                         : (canAfford 
                            ? 'border-blue-500/50 bg-slate-800/80 hover:border-blue-400 hover:bg-slate-700 hover:translate-x-1 shadow-lg' 
                            : 'border-gray-700 bg-gray-900 opacity-80 cursor-not-allowed')
                       }`}
                   >
                     {isLocked && (
                       <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                         <div className="flex flex-col items-center text-gray-400">
                           <span className="text-2xl mb-1">🔒</span>
                           <span className="text-xs font-bold font-mono">{lockReason}</span>
                         </div>
                       </div>
                     )}

                     <div className="flex justify-between items-start z-10 relative">
                       <div>
                         <div className={`font-bold ${isLocked ? 'text-gray-500' : 'text-white group-hover:text-blue-300'}`}>
                            {b.name}
                         </div>
                         <div className="text-xs text-blue-200/70 mt-1">Prod: +{formatNumber(b.baseProd)}/s</div>
                       </div>
                       <div className="text-right">
                         <div className="text-2xl font-bold font-mono text-gray-200">{count}</div>
                         <div className={`text-xs font-bold mt-1 ${canAfford && !isLocked ? 'text-green-400' : 'text-gray-500'}`}>
                           {formatNumber(cost)} CP
                         </div>
                       </div>
                     </div>
                     {!isLocked && (
                        <div className="mt-2 text-[10px] text-gray-500 italic border-t border-gray-700/50 pt-2">
                          "{b.flavor}"
                        </div>
                     )}
                   </button>
                </div>
              );
            })}
           </div>
        )}

        {activeTab === 'HARDWARE' && renderUpgradeList(hardwareUpgrades)}
        {activeTab === 'SOFTWARE' && renderUpgradeList(softwareUpgrades)}
        {activeTab === 'MARKET' && renderUpgradeList(marketUpgrades)}

      </div>
    </div>
  );
};

export default TechTree;