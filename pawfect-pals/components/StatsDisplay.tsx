import React from 'react';
import { ActivePet } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface StatsDisplayProps {
  pet: ActivePet;
}

const StatBar: React.FC<{ label: string; value: number; color: string; reverse?: boolean }> = ({ label, value, color, reverse }) => {
  // For hunger, high is bad (red), low is good (green).
  // For happiness, high is good (green), low is bad (red).
  let barColor = color;
  if (reverse) {
     barColor = value > 70 ? 'bg-red-500' : value > 30 ? 'bg-yellow-500' : 'bg-green-500';
  } else {
     barColor = value < 30 ? 'bg-red-500' : value < 70 ? 'bg-yellow-500' : 'bg-green-500';
  }

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider text-slate-600">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-out ${barColor}`} 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};

const StatsDisplay: React.FC<StatsDisplayProps> = ({ pet }) => {
  const chartData = [
    { subject: 'Happy', A: pet.stats.happiness, fullMark: 100 },
    { subject: 'Energy', A: pet.stats.energy, fullMark: 100 },
    { subject: 'Full', A: 100 - pet.stats.hunger, fullMark: 100 }, // Invert hunger for "Goodness" chart
    { subject: 'Love', A: pet.stats.affection, fullMark: 100 },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        Vital Signs
      </h3>
      
      <div className="space-y-3">
        <StatBar label="Happiness" value={pet.stats.happiness} color="bg-pink-500" />
        <StatBar label="Hunger" value={pet.stats.hunger} color="bg-orange-500" reverse />
        <StatBar label="Energy" value={pet.stats.energy} color="bg-blue-500" />
        <StatBar label="Affection" value={pet.stats.affection} color="bg-purple-500" />
      </div>

      {/* Radar Chart for Personality/Current State Balance */}
      <div className="h-48 mt-4 -ml-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name={pet.customName}
              dataKey="A"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsDisplay;
