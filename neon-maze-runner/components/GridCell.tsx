import React from 'react';
import { CellType, Coordinate } from '../types';
import { MousePointer2, Flag, Skull } from 'lucide-react';

interface GridCellProps {
  x: number;
  y: number;
  type: CellType;
  isPath: boolean;
  isValidBuildLocation?: boolean; // For hover effects
  onClick: (x: number, y: number) => void;
}

export const GridCell: React.FC<GridCellProps> = ({
  x,
  y,
  type,
  isPath,
  onClick,
}) => {
  
  const getCellStyles = () => {
    switch (type) {
      case CellType.WALL:
        return 'bg-cyan-500 shadow-[0_0_10px_#06b6d4] border-cyan-400 z-10';
      case CellType.OBSTACLE:
        return 'bg-slate-700 border-slate-600 opacity-80';
      case CellType.START:
        return 'bg-emerald-900/50 border-emerald-500/50';
      case CellType.END:
        return 'bg-rose-900/50 border-rose-500/50';
      default:
        // Empty
        return isPath 
          ? 'bg-slate-800/80 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]' 
          : 'bg-slate-800/30 hover:bg-slate-700/50';
    }
  };

  const getIcon = () => {
    if (type === CellType.START) return <MousePointer2 className="w-5 h-5 text-emerald-400" />;
    if (type === CellType.END) return <Flag className="w-5 h-5 text-rose-400" />;
    if (type === CellType.OBSTACLE) return <div className="w-2 h-2 rounded-full bg-slate-500" />;
    return null;
  };

  return (
    <div
      onClick={() => onClick(x, y)}
      className={`
        relative w-full h-full flex items-center justify-center
        border border-slate-800/50 transition-all duration-200 cursor-pointer
        ${getCellStyles()}
        ${isPath && type === CellType.EMPTY ? 'after:content-[""] after:absolute after:w-2 after:h-2 after:bg-emerald-500/20 after:rounded-full' : ''}
      `}
    >
        {getIcon()}
    </div>
  );
};
