import React from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { TravelStats } from '../types';

interface StatsBadgeProps {
  stats: TravelStats;
  onReset: () => void;
}

const StatsBadge: React.FC<StatsBadgeProps> = ({ stats, onReset }) => {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleResetClick = () => {
    if (showConfirm) {
      onReset();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000); // Hide confirm after 3s
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 max-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-orange-500 font-bold">
            <Trophy size={18} className="mr-2" />
            <span className="text-sm uppercase tracking-wider">Progress</span>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="text-3xl font-black text-gray-800">
            {stats.visited} <span className="text-lg text-gray-400 font-medium">/ {stats.total}</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">Landmarks Visited</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-1000 ease-out"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Reset Button */}
      {stats.visited > 0 && (
         <button
           onClick={handleResetClick}
           className={`bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-md border border-gray-100 text-xs font-bold flex items-center justify-center transition-all duration-200 ${
             showConfirm ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-gray-700'
           }`}
         >
           <RotateCcw size={14} className="mr-2" />
           {showConfirm ? 'Tap to Confirm' : 'Reset Progress'}
         </button>
      )}
    </div>
  );
};

export default StatsBadge;