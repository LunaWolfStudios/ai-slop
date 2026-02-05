import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COST_DATA } from '../constants';
import { ArrowRight, Clock, DollarSign, Leaf } from 'lucide-react';

interface Props {
  onNext: () => void;
}

const CostDashboard: React.FC<Props> = ({ onNext }) => {
  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col">
       <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Cost & Impact <span className="text-orange-500">Analysis</span></h2>
          <p className="text-slate-400">Long-term ROI and environmental efficiency.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* KPI Cards */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">40%</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Lower Install Cost</div>
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">3x</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Faster Deployment</div>
                </div>
            </div>

             <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Leaf className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">-85%</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Carbon Footprint</div>
                </div>
            </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-700 p-6 min-h-[300px]">
            <h3 className="text-lg font-bold text-white mb-6">Cumulative Cost Over 10 Years ($k per 100m)</h3>
            <ResponsiveContainer width="100%" height="80%">
                <BarChart data={COST_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="traditional" name="Traditional Concrete" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="soundshield" name="SoundShield" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="mt-6 flex justify-end">
             <button 
                onClick={onNext}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-lg shadow-cyan-900/20 transition-all hover:translate-x-1"
              >
                Explore Applications <ArrowRight className="w-5 h-5" />
              </button>
        </div>
    </div>
  );
};

export default CostDashboard;
