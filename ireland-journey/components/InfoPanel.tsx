import React, { useState, useEffect } from 'react';
import { Landmark } from '../types';
import { X, CheckCircle, Circle, MapPin, Navigation, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

interface InfoPanelProps {
  landmark: Landmark | null;
  isVisited: boolean;
  onClose: () => void;
  onToggleVisited: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  landmark, 
  isVisited, 
  onClose, 
  onToggleVisited,
  onNext,
  onPrev
}) => {
  const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Reset image state when landmark changes
  useEffect(() => {
    setImgState('loading');
  }, [landmark?.id]);

  if (!landmark) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 md:p-6 md:w-96 md:left-auto md:top-0 md:h-full pointer-events-none flex flex-col justify-end md:justify-start">
      {/* Container with pointer-events-auto so the map behind is clickable outside this box */}
      <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 duration-300 flex flex-col max-h-[80vh] group">
        
        {/* Header Image & Navigation */}
        <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
          
          {/* Loading Skeleton */}
          {imgState === 'loading' && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-gray-400 text-sm font-medium">Loading view...</span>
            </div>
          )}

          {/* Error State */}
          {imgState === 'error' && (
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
              <ImageOff size={32} className="mb-2 opacity-50" />
              <span className="text-xs">Image unavailable</span>
            </div>
          )}

          <img 
            src={landmark.imageUrl} 
            alt={landmark.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgState === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgState('loaded')}
            onError={() => setImgState('error')}
          />
          
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-20"
          >
            <X size={20} />
          </button>
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm uppercase tracking-wide z-10">
            {landmark.category}
          </div>

          {/* Nav Buttons (Overlay on Image) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{landmark.name}</h2>
          
          <div className="flex items-center text-gray-500 mb-4 text-sm">
            <MapPin size={14} className="mr-1" />
            <span>{landmark.lat.toFixed(4)}, {landmark.lng.toFixed(4)}</span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">
            {landmark.description}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onToggleVisited(landmark.id)}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center font-semibold transition-all duration-200 transform active:scale-95 shadow-md ${
                isVisited 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isVisited ? (
                <>
                  <CheckCircle size={20} className="mr-2" />
                  Visited
                </>
              ) : (
                <>
                  <Circle size={20} className="mr-2" />
                  Mark as Visited
                </>
              )}
            </button>

             {/* External Link */}
             <a 
               href={`https://www.google.com/maps/search/?api=1&query=${landmark.lat},${landmark.lng}`}
               target="_blank"
               rel="noreferrer"
               className="w-full py-3 px-4 rounded-xl flex items-center justify-center font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
             >
               <Navigation size={18} className="mr-2" />
               Get Directions
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;