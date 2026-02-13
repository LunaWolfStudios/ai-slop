import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { LANDMARKS, IRELAND_CENTER, DEFAULT_ZOOM, LOCAL_STORAGE_KEY } from './constants';
import { Landmark, TravelStats } from './types';
import LandmarkMarker from './components/LandmarkMarker';
import InfoPanel from './components/InfoPanel';
import StatsBadge from './components/StatsBadge';
import { Map as MapIcon } from 'lucide-react';

// Helper to update map view when selection changes
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  const previousCenter = useRef<[number, number]>(center);
  const previousZoom = useRef<number>(zoom);

  useEffect(() => {
    // Only fly if center or zoom has actually changed significantly
    const [lat, lng] = center;
    const [prevLat, prevLng] = previousCenter.current;
    
    const moved = Math.abs(lat - prevLat) > 0.0001 || Math.abs(lng - prevLng) > 0.0001;
    const zoomed = zoom !== previousZoom.current;

    if (moved || zoomed) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      previousCenter.current = center;
      previousZoom.current = zoom;
    }
  }, [center, zoom, map]);
  return null;
};

const App: React.FC = () => {
  // State
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Local Storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Assuming stored object is { [id]: boolean }
        const visitedSet = new Set<string>();
        Object.keys(parsed).forEach(key => {
          if (parsed[key]) visitedSet.add(key);
        });
        setVisitedIds(visitedSet);
      }
    } catch (error) {
      console.error("Failed to load travel data", error);
    }
    setIsLoaded(true);
  }, []);

  // Sync to Local Storage whenever visitedIds changes
  useEffect(() => {
    if (!isLoaded) return;
    const storageObj: Record<string, boolean> = {};
    visitedIds.forEach(id => {
      storageObj[id] = true;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storageObj));
  }, [visitedIds, isLoaded]);

  // Handlers
  const handleToggleVisited = (id: string) => {
    setVisitedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleReset = () => {
    setVisitedIds(new Set());
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleLandmarkSelect = (landmark: Landmark) => {
    setSelectedLandmark(landmark);
  };

  const handleClosePanel = () => {
    setSelectedLandmark(null);
  };

  const handleNextLandmark = () => {
    if (!selectedLandmark) return;
    const currentIndex = LANDMARKS.findIndex(l => l.id === selectedLandmark.id);
    const nextIndex = (currentIndex + 1) % LANDMARKS.length;
    setSelectedLandmark(LANDMARKS[nextIndex]);
  };

  const handlePrevLandmark = () => {
    if (!selectedLandmark) return;
    const currentIndex = LANDMARKS.findIndex(l => l.id === selectedLandmark.id);
    const prevIndex = (currentIndex - 1 + LANDMARKS.length) % LANDMARKS.length;
    setSelectedLandmark(LANDMARKS[prevIndex]);
  };

  // Stats
  const stats: TravelStats = useMemo(() => {
    const total = LANDMARKS.length;
    const visited = visitedIds.size;
    const percentage = total === 0 ? 0 : Math.round((visited / total) * 100);
    return { total, visited, percentage };
  }, [visitedIds]);

  // View Calculation
  // We use useMemo to ensure the array reference is stable unless selection changes
  const mapCenter: [number, number] = useMemo(() => {
    return selectedLandmark 
      ? [selectedLandmark.lat, selectedLandmark.lng] 
      : IRELAND_CENTER;
  }, [selectedLandmark]);
    
  const mapZoom = selectedLandmark ? 11 : DEFAULT_ZOOM;

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden font-sans">
      
      {/* Background/Loader if needed, but Leaflet usually handles it */}
      
      <MapContainer 
        center={IRELAND_CENTER} 
        zoom={DEFAULT_ZOOM} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0 outline-none"
        zoomControl={false} // We will add custom controls or rely on touch
        tap={false} // Explicitly disable tap in recent Leaflet versions if using react-leaflet to let browser handle touch
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* Update view when selection changes */}
        <MapUpdater center={mapCenter} zoom={mapZoom} />

        {/* Render Markers */}
        {LANDMARKS.map(landmark => (
          <LandmarkMarker
            key={landmark.id}
            landmark={landmark}
            visited={visitedIds.has(landmark.id)}
            selected={selectedLandmark?.id === landmark.id}
            onSelect={handleLandmarkSelect}
          />
        ))}

      </MapContainer>

      {/* Floating UI Layer */}
      <div className="absolute inset-0 pointer-events-none z-[500]">
        
        {/* Stats Badge (Top Left) */}
        <StatsBadge stats={stats} onReset={handleReset} />
        
        {/* App Title (Top Center - visible on desktop mostly) */}
        <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none hidden md:flex">
           <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm flex items-center text-gray-700 font-bold border border-white/50">
              <MapIcon size={18} className="mr-2 text-green-600" />
              My Ireland Journey
           </div>
        </div>

      </div>

      {/* Info Panel (Bottom Sheet / Sidebar) */}
      <InfoPanel 
        landmark={selectedLandmark} 
        isVisited={selectedLandmark ? visitedIds.has(selectedLandmark.id) : false}
        onClose={handleClosePanel}
        onToggleVisited={handleToggleVisited}
        onNext={handleNextLandmark}
        onPrev={handlePrevLandmark}
      />

    </div>
  );
};

export default App;