import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ComputedState, CountingSystem } from '../types';
import { Activity, Layers, Disc } from 'lucide-react';

interface DashboardProps {
  stats: ComputedState;
  system: CountingSystem;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, system }) => {
  const isPositive = stats.trueCount >= 1;
  const isNegative = stats.trueCount <= -1;

  // Determine glow color
  const glowClass = isPositive 
    ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-500/50' 
    : isNegative 
      ? 'shadow-[0_0_20px_rgba(244,63,94,0.3)] border-rose-500/50' 
      : 'border-casino-700';

  const textColor = isPositive 
    ? 'text-neon-green' 
    : isNegative 
      ? 'text-neon-red' 
      : 'text-slate-200';

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`col-span-2 md:col-span-2 p-6 rounded-2xl bg-casino-800/80 border transition-all duration-300 ${glowClass} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={64} />
          </div>
          <div className="flex justify-between items-end">
             <div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">True Count</h3>
                <div className={`text-5xl md:text-6xl font-bold font-mono tracking-tighter ${textColor} transition-colors duration-300`}>
                  {stats.trueCount > 0 ? '+' : ''}{stats.trueCount.toFixed(2)}
                </div>
             </div>
             <div className="text-right">
               <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Running</h3>
               <div className="text-2xl font-mono text-slate-300">
                  {stats.runningCount > 0 ? '+' : ''}{stats.runningCount}
               </div>
             </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
            <span className="text-xs text-slate-400">Advantage Estimate</span>
            <span className={`text-sm font-bold ${stats.advantage > 0.5 ? 'text-neon-gold' : 'text-slate-300'}`}>
              {stats.advantage > 0 ? '+' : ''}{stats.advantage}%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-casino-800/50 border border-casino-700 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Layers size={18} />
            <span className="text-xs font-medium uppercase">Decks Left</span>
          </div>
          <div className="text-2xl font-mono text-slate-200 font-semibold">
            {stats.decksRemaining.toFixed(2)}
          </div>
          <div className="mt-2 w-full bg-casino-900 rounded-full h-1.5 overflow-hidden">
            {/* Visual bar of deck penetration */}
            <div 
              className="h-full bg-cyan-500 transition-all duration-500" 
              style={{ width: `${Math.min(100, (stats.decksRemaining / (stats.cardsSeen/52 + stats.decksRemaining)) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-casino-800/50 border border-casino-700 flex flex-col justify-center">
           <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Disc size={18} />
            <span className="text-xs font-medium uppercase">Cards Seen</span>
          </div>
          <div className="text-2xl font-mono text-slate-200 font-semibold">
            {stats.cardsSeen}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Penetration: {((stats.cardsSeen / ((stats.cardsSeen + (stats.decksRemaining * 52)) || 1)) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="h-64 w-full bg-casino-800/40 border border-casino-700 rounded-xl p-4 backdrop-blur-sm">
         <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-semibold">True Count History</h4>
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.historyPoints}>
              <defs>
                <linearGradient id="colorTc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => val.toFixed(1)} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#06b6d4' }}
                labelStyle={{ display: 'none' }}
                formatter={(val: number) => [val, 'True Count']}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLine y={2} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Bet', fill: '#10b981', fontSize: 10, position: 'right' }} />
              <Area 
                type="monotone" 
                dataKey="tc" 
                stroke="#06b6d4" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTc)" 
                isAnimationActive={false}
              />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};
