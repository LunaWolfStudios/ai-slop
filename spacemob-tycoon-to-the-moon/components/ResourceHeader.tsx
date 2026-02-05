import React from 'react';

interface ResourceHeaderProps {
  cp: number;
  subscribers: number;
  hype: number;
  cps: number;
}

const formatNumber = (num: number) => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
  return Math.floor(num).toLocaleString();
};

const ResourceHeader: React.FC<ResourceHeaderProps> = ({ cp, subscribers, hype, cps }) => {
  return (
    <div className="w-full bg-[#1e293b]/90 backdrop-blur-md border-b border-white/10 p-3 flex flex-wrap justify-between items-center z-50 shadow-lg">
      <div className="flex items-center gap-6 px-4">
        {/* CP */}
        <div className="flex flex-col">
          <span className="text-xs text-blue-300 font-bold tracking-wider">CONNECTIVITY</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-orbitron font-bold text-blue-400">{formatNumber(cp)}</span>
            <span className="text-xs text-gray-400">({formatNumber(cps)}/s)</span>
          </div>
        </div>

        {/* Subscribers */}
        <div className="flex flex-col border-l border-white/10 pl-6">
           <span className="text-xs text-pink-300 font-bold tracking-wider">SUBSCRIBERS</span>
           <span className="text-2xl font-orbitron font-bold text-pink-400">{formatNumber(subscribers)}</span>
        </div>

        {/* Hype */}
        <div className="flex flex-col border-l border-white/10 pl-6 hidden md:flex">
           <span className="text-xs text-yellow-300 font-bold tracking-wider">HYPE</span>
           <span className="text-2xl font-orbitron font-bold text-yellow-400">{formatNumber(hype)}</span>
        </div>
      </div>

      <div className="px-4 hidden md:block text-xs text-gray-500 italic">
        "Connecting the Unconnected"
      </div>
    </div>
  );
};

export default ResourceHeader;