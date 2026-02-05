import React from 'react';
import { Utensils, Gamepad2, Hand, LogOut } from 'lucide-react';
import { Item } from '../types';

interface ControlsProps {
  onFeed: () => void;
  onPlay: () => void;
  onPet: () => void;
  onReset: () => void;
  inventory: Item[];
  disabled: boolean;
}

const ControlButton: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
  color: string;
  disabled?: boolean;
}> = ({ icon, label, onClick, color, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl shadow-md transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white ${color}`}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-xs font-bold">{label}</span>
  </button>
);

const Controls: React.FC<ControlsProps> = ({ onFeed, onPlay, onPet, onReset, disabled }) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-3xl shadow-2xl flex gap-4 items-center z-50 border border-slate-100">
      <ControlButton 
        icon={<Utensils size={24} />} 
        label="Feed" 
        onClick={onFeed} 
        color="bg-orange-500 hover:bg-orange-600"
        disabled={disabled}
      />
      <ControlButton 
        icon={<Gamepad2 size={24} />} 
        label="Play" 
        onClick={onPlay} 
        color="bg-blue-500 hover:bg-blue-600"
        disabled={disabled}
      />
      <ControlButton 
        icon={<Hand size={24} />} 
        label="Pet" 
        onClick={onPet} 
        color="bg-pink-500 hover:bg-pink-600"
        disabled={disabled}
      />
      <div className="w-px h-12 bg-slate-200 mx-2"></div>
      <button 
        onClick={onReset}
        className="p-3 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        title="Return to Menu"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
};

export default Controls;
