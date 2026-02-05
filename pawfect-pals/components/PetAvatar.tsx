import React from 'react';
import { Cat, Dog, Sparkles, Moon, Heart } from 'lucide-react';
import { ActivePet, PetState, PetType } from '../types';

interface PetAvatarProps {
  pet: ActivePet;
}

const PetAvatar: React.FC<PetAvatarProps> = ({ pet }) => {
  const isDog = pet.type === PetType.DOG;
  
  // Animation classes based on state
  const getAnimationClass = () => {
    switch (pet.state) {
      case PetState.PLAYING:
        return 'animate-bounce';
      case PetState.SLEEPING:
        return 'opacity-80 scale-95';
      case PetState.EATING:
        return 'animate-pulse';
      case PetState.EXCITED:
        return 'animate-spin-slow'; // Custom spin logic below ideally, but using standard utils
      case PetState.UNHAPPY:
        return 'grayscale';
      default:
        return 'animate-float'; // Gentle idle float
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center transition-all duration-500">
      {/* Thought Bubble */}
      {pet.thought && (
        <div className="absolute -top-24 bg-white p-3 rounded-2xl shadow-lg border-2 border-slate-200 animate-fade-in max-w-[200px] text-center z-10">
          <p className="text-sm font-medium text-slate-700">{pet.thought}</p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-slate-200 rotate-45"></div>
        </div>
      )}

      {/* Status Icons */}
      <div className="absolute -top-8 right-0 flex gap-2">
        {pet.state === PetState.SLEEPING && <Moon className="text-blue-500 animate-pulse" />}
        {pet.state === PetState.EXCITED && <Sparkles className="text-yellow-500 animate-spin" />}
        {(pet.state === PetState.IDLE && pet.stats.affection > 80) && <Heart className="text-red-500 animate-bounce" fill="currentColor" />}
      </div>

      {/* The Pet */}
      <div className={`p-8 rounded-full ${pet.color} border-4 border-white shadow-xl ${getAnimationClass()}`}>
        {isDog ? (
          <Dog size={120} className="text-slate-800" />
        ) : (
          <Cat size={120} className="text-slate-800" />
        )}
      </div>

      {/* Shadow */}
      <div className="w-32 h-4 bg-black/10 rounded-full mt-4 blur-sm"></div>
    </div>
  );
};

export default PetAvatar;