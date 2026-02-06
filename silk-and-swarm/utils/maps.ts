import { Anchor, MapId } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, NEST_RADIUS } from '../constants';

export const generateMapAnchors = (mapId: MapId): Anchor[] => {
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;
  const anchors: Anchor[] = [];
  
  const addAnchor = (x: number, y: number, r = 8) => {
    // Basic bounds check
    if (x < 20 || x > CANVAS_WIDTH - 20 || y < 20 || y > CANVAS_HEIGHT - 20) return;
    anchors.push({
       id: `a-${anchors.length}`,
       pos: { x, y },
       radius: r
    });
  };

  switch (mapId) {
    case MapId.CITY:
      // Grid Layout
      for (let x = 100; x <= CANVAS_WIDTH - 100; x += 180) {
        for (let y = 100; y <= CANVAS_HEIGHT - 100; y += 150) {
           const dist = Math.sqrt((x-centerX)**2 + (y-centerY)**2);
           if (dist > NEST_RADIUS * 2.5) {
             addAnchor(x, y, 10);
           }
        }
      }
      break;

    case MapId.FOREST:
      // Organic Clusters (Trees)
      // Create 6 major trees
      for (let i = 0; i < 6; i++) {
         const angle = (Math.PI * 2 * i) / 6 + (Math.random() * 0.5);
         const dist = 200 + Math.random() * 150;
         const cx = centerX + Math.cos(angle) * dist;
         const cy = centerY + Math.sin(angle) * dist;
         
         // Trunk
         addAnchor(cx, cy, 12);
         // Branches
         for(let j=0; j<4; j++) {
            const a2 = (Math.PI * 2 * j) / 4 + Math.random() * 0.5;
            const d2 = 50 + Math.random() * 30;
            addAnchor(cx + Math.cos(a2)*d2, cy + Math.sin(a2)*d2);
         }
      }
      // Random scatter
      for(let i=0; i<12; i++) {
         const a = Math.random() * Math.PI * 2;
         const d = 150 + Math.random() * 350;
         addAnchor(centerX + Math.cos(a)*d, centerY + Math.sin(a)*d);
      }
      break;

    case MapId.GARDEN:
      // Radial Symmetry (Petals)
      const petals = 6;
      for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 * i) / petals;
        // Central spine
        addAnchor(centerX + Math.cos(angle) * 150, centerY + Math.sin(angle) * 150);
        addAnchor(centerX + Math.cos(angle) * 280, centerY + Math.sin(angle) * 280);
        addAnchor(centerX + Math.cos(angle) * 400, centerY + Math.sin(angle) * 400);
        
        // Leaf edges
        const leafW = 0.2;
        addAnchor(centerX + Math.cos(angle - leafW) * 220, centerY + Math.sin(angle - leafW) * 220);
        addAnchor(centerX + Math.cos(angle + leafW) * 220, centerY + Math.sin(angle + leafW) * 220);
      }
      break;

    case MapId.DEFAULT:
    default:
      // Classic Rings
       for (let r = 1; r <= 4; r++) {
        const radius = 120 * r;
        const points = 6 + (r * 2);
        for (let i = 0; i < points; i++) {
          const angle = (Math.PI * 2 * i) / points + (Math.random() * 0.2 - 0.1);
          addAnchor(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        }
      }
      break;
  }

  // Always add Nest
  anchors.push({ id: 'nest', pos: { x: centerX, y: centerY }, radius: NEST_RADIUS });
  
  // Clean up overlaps
  return anchors.filter((a, i) => {
     if (a.id === 'nest') return true;
     // Check distance to nest
     const dNest = Math.sqrt((a.pos.x - centerX)**2 + (a.pos.y - centerY)**2);
     if (dNest < NEST_RADIUS + 20) return false;
     
     // Check duplicate positions
     const index = anchors.findIndex(other => other.id !== a.id && Math.abs(other.pos.x - a.pos.x) < 10 && Math.abs(other.pos.y - a.pos.y) < 10);
     if (index !== -1 && index < i) return false;
     
     return true;
  });
};

export const getMapTheme = (mapId: MapId) => {
    switch(mapId) {
        case MapId.CITY: return { bg: '#172554', grid: '#1e3a8a', anchor: '#60a5fa', name: 'Metro Grid' }; // Blue
        case MapId.FOREST: return { bg: '#022c22', grid: '#064e3b', anchor: '#34d399', name: 'Deep Forest' }; // Green
        case MapId.GARDEN: return { bg: '#3b0764', grid: '#581c87', anchor: '#c084fc', name: 'Royal Garden' }; // Purple
        default: return { bg: '#0f172a', grid: '#1e293b', anchor: '#94a3b8', name: 'The Web' }; // Slate
    }
};