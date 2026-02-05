import React, { useState } from 'react';
import { Polyomino, GRID_SIZE, Player, ElementType } from '../types';
import { COLORS } from '../constants';

interface InventoryProps {
  player: Player;
  onUpdateLoadout: (equipped: (Polyomino | null)[], inventory: Polyomino[]) => void;
  onClose: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ player, onUpdateLoadout, onClose }) => {
  const [draggedItem, setDraggedItem] = useState<{ source: 'inv' | 'grid', index: number, item: Polyomino } | null>(null);

  // Helper to render a mini shape
  const renderShape = (shape: boolean[][], color: string) => {
    return (
      <div className="grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${shape[0].length}, 10px)` }}>
        {shape.flatMap((row, y) => 
          row.map((cell, x) => (
            <div key={`${x}-${y}`} style={{ width: 10, height: 10, background: cell ? color : 'transparent', boxShadow: cell ? `0 0 4px ${color}` : 'none' }} />
          ))
        )}
      </div>
    );
  };

  const handleDragStart = (e: React.DragEvent, source: 'inv' | 'grid', index: number, item: Polyomino) => {
    setDraggedItem({ source, index, item });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number, targetSource: 'grid' | 'inv') => {
    e.preventDefault();
    if (!draggedItem) return;

    const newInventory = [...player.inventory];
    const newEquipped = [...player.equipped];

    if (draggedItem.source === 'inv' && targetSource === 'grid') {
      const itemAtTarget = newEquipped[targetIndex];
      newEquipped[targetIndex] = draggedItem.item;
      newInventory.splice(draggedItem.index, 1);
      if (itemAtTarget) newInventory.push(itemAtTarget);
    } 
    else if (draggedItem.source === 'grid' && targetSource === 'grid') {
      const itemAtTarget = newEquipped[targetIndex];
      newEquipped[targetIndex] = draggedItem.item;
      newEquipped[draggedItem.index] = itemAtTarget;
    }
    else if (draggedItem.source === 'grid' && targetSource === 'inv') {
      newEquipped[draggedItem.index] = null;
      newInventory.push(draggedItem.item);
    }

    onUpdateLoadout(newEquipped, newInventory);
    setDraggedItem(null);
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-8 text-white select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-black/80 to-black z-0 pointer-events-none"></div>
      
      <div className="z-10 w-full max-w-6xl flex flex-col items-center">
        <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
          RUNE FORGE
        </h2>
        <p className="mb-8 text-gray-400 text-sm tracking-widest uppercase">Socket the artifacts to tune your frequency</p>

        <div className="flex flex-row items-start justify-center gap-16 w-full">
          
          {/* STAFF VISUALIZATION */}
          <div className="relative flex flex-col items-center">
             <h3 className="mb-4 font-bold text-lg text-yellow-500 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
               STAFF HEAD
             </h3>
             
             {/* The Staff Head Container */}
             <div className="relative p-6 bg-gray-900 rounded-xl border-4 border-gray-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center">
                {/* Decorative Staff Pole connecting downwards */}
                <div className="absolute -bottom-20 w-8 h-24 bg-gradient-to-r from-gray-800 to-gray-600 border-x-2 border-gray-950 z-[-1]"></div>
                
                {/* Glow behind grid */}
                <div className="absolute inset-0 bg-purple-600/10 blur-xl rounded-full"></div>

                <div className="grid grid-cols-4 gap-3 bg-gray-950 p-4 rounded-lg border border-gray-700 shadow-inner relative z-10">
                  {player.equipped.map((item, idx) => (
                    <div
                      key={`slot-${idx}`}
                      className={`w-14 h-14 rounded border-2 flex items-center justify-center transition-all duration-200
                        ${item 
                          ? 'bg-gray-800 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                          : 'bg-gray-900/50 border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'
                        }
                      `}
                      onDragOver={allowDrop}
                      onDrop={(e) => handleDrop(e, idx, 'grid')}
                    >
                      {item ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'grid', idx, item)}
                          className="flex flex-col items-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        >
                          {renderShape(item.shape, item.color)}
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats Summary Panel attached to staff */}
                <div className="mt-6 w-full bg-gray-800/80 p-3 rounded border border-gray-600 text-xs grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
                    <div className="flex justify-between"><span>DMG:</span> <span className="text-white font-bold">{player.stats.damage.toFixed(1)}</span></div>
                    <div className="flex justify-between"><span>SPD:</span> <span className="text-white font-bold">{player.stats.speed.toFixed(1)}</span></div>
                    <div className="flex justify-between"><span>FIRE:</span> <span className="text-white font-bold">{(60 / player.stats.fireRate).toFixed(1)}/s</span></div>
                    <div className="flex justify-between"><span>SHOTS:</span> <span className="text-white font-bold">{player.stats.multishot}</span></div>
                    <div className="col-span-2 mt-2 pt-2 border-t border-gray-600 text-center text-purple-300 font-bold uppercase">
                      {player.element} AURA
                    </div>
                </div>
             </div>
          </div>

          {/* INVENTORY BAG */}
          <div className="flex flex-col items-center w-80">
            <h3 className="mb-4 font-bold text-lg text-blue-400">RUNE BAG</h3>
            <div 
              className="w-full h-[500px] bg-gray-900/80 p-4 rounded-xl border border-gray-700 overflow-y-auto grid grid-cols-4 gap-3 content-start shadow-xl scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
              onDragOver={allowDrop}
              onDrop={(e) => handleDrop(e, -1, 'inv')}
            >
              {player.inventory.map((item, idx) => (
                <div
                  key={item.id + idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'inv', idx, item)}
                  className="aspect-square bg-gray-800 rounded border border-gray-600 flex flex-col items-center justify-center hover:bg-gray-700 hover:border-blue-500 cursor-grab active:cursor-grabbing transition-colors relative group"
                >
                  {renderShape(item.shape, item.color)}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black border border-gray-600 text-xs p-2 rounded w-32 z-50 pointer-events-none">
                    <div className="font-bold text-white mb-1">{item.name}</div>
                    {Object.entries(item.stats).map(([k, v]) => {
                      const val = v as number;
                      return (
                      <div key={k} className="flex justify-between text-gray-400">
                        <span className="capitalize">{k}:</span>
                        <span>{val > 0 ? '+' : ''}{val}</span>
                      </div>
                    )})}
                  </div>
                </div>
              ))}
              {/* Empty slot placeholders for visual consistency */}
              {Array.from({ length: Math.max(0, 20 - player.inventory.length) }).map((_, i) => (
                 <div key={`inv-empty-${i}`} className="aspect-square rounded border border-dashed border-gray-800 bg-gray-900/30"></div>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-12 flex gap-4">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 border border-purple-400/30"
          >
            CLOSE & FIGHT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;