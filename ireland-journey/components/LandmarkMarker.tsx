import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Landmark } from '../types';
import { MapPin, Check } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface LandmarkMarkerProps {
  landmark: Landmark;
  visited: boolean;
  selected: boolean;
  onSelect: (landmark: Landmark) => void;
}

const LandmarkMarker: React.FC<LandmarkMarkerProps> = ({ landmark, visited, selected, onSelect }) => {
  
  // Create a custom DivIcon using pure HTML/CSS classes from Tailwind
  // We wrap the visual marker in a larger container to guarantee a minimum touch target of 50x50px
  const createIcon = () => {
    // Visual sizes (inner circle) - slightly larger than before for better visibility
    // Unselected: w-10 (40px) | Selected: w-12 (48px)
    // The container is fixed at 50px to ensure a large hit area
    const visualSize = selected ? 'w-12 h-12' : 'w-10 h-10'; 
    const colorClass = visited ? 'bg-green-500' : 'bg-blue-600';
    const borderClass = selected ? 'border-[3px] border-yellow-400' : 'border-2 border-white';
    
    // Icon inside the pin
    const iconSvg = visited 
      ? renderToStaticMarkup(<Check color="white" size={18} strokeWidth={3} />)
      : renderToStaticMarkup(<MapPin color="white" size={18} fill="currentColor" className="text-blue-700" />);

    // We use a flex container to center the visual marker within the larger hit box
    // 'group' class allows us to handle hover states on the child
    const html = `
      <div class="w-full h-full flex items-center justify-center group">
         <div class="${colorClass} ${borderClass} ${visualSize} rounded-full shadow-lg flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110 relative">
            <div class="pointer-events-none">${iconSvg}</div>
            ${!visited && !selected ? '<span class="absolute -bottom-1 w-2 h-2 bg-black/20 rounded-full blur-[1px]"></span>' : ''}
         </div>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-marker bg-transparent', // Transparent background for the hit box
      iconSize: [50, 50], // Large hit box (50x50px)
      iconAnchor: [25, 25], // Center of the hit box
    });
  };

  return (
    <Marker 
      position={[landmark.lat, landmark.lng]} 
      icon={createIcon()}
      eventHandlers={{
        click: (e) => {
          // Critical for mobile: prevent map tap events when tapping the marker
          L.DomEvent.stopPropagation(e.originalEvent);
          onSelect(landmark);
        },
      }}
    >
      <Tooltip 
        direction="bottom" 
        offset={[0, 16]} 
        opacity={1} 
        permanent 
        className="custom-map-tooltip"
      >
        {landmark.name}
      </Tooltip>
    </Marker>
  );
};

export default LandmarkMarker;