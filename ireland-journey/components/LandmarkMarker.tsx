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
  // We use renderToStaticMarkup to convert the React icon to an SVG string
  const createIcon = () => {
    const colorClass = visited ? 'bg-green-500' : 'bg-blue-600';
    const borderClass = selected ? 'border-4 border-yellow-400' : 'border-2 border-white';
    const size = selected ? 'w-10 h-10' : 'w-8 h-8';
    
    // Icon inside the pin
    const iconSvg = visited 
      ? renderToStaticMarkup(<Check color="white" size={16} strokeWidth={3} />)
      : renderToStaticMarkup(<MapPin color="white" size={16} fill="currentColor" className="text-blue-700" />);

    const html = `
      <div class="${colorClass} ${borderClass} ${size} rounded-full shadow-lg flex items-center justify-center transform transition-all duration-300 relative">
         <div class="pointer-events-none">${iconSvg}</div>
         ${!visited && !selected ? '<span class="absolute -bottom-1 w-2 h-2 bg-black/20 rounded-full blur-[1px]"></span>' : ''}
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-marker bg-transparent', // Remove default leaflet background
      iconSize: selected ? [40, 40] : [32, 32],
      iconAnchor: selected ? [20, 20] : [16, 16], // Center the icon
    });
  };

  return (
    <Marker 
      position={[landmark.lat, landmark.lng]} 
      icon={createIcon()}
      eventHandlers={{
        click: () => onSelect(landmark),
      }}
    >
      <Tooltip 
        direction="bottom" 
        offset={[0, 10]} 
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