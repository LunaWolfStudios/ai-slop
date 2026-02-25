import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Commit } from '../types';

interface GraphProps {
  repo?: GameState['repo'];
}

export const Graph: React.FC<GraphProps> = ({ repo }) => {
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);

  const nodes = useMemo(() => {
    if (!repo || repo.commits.length === 0) return [];

    // Build parent-child map
    const childrenMap: Record<string, string[]> = {};
    repo.commits.forEach(c => {
      if (c.parentId) {
        if (!childrenMap[c.parentId]) childrenMap[c.parentId] = [];
        childrenMap[c.parentId].push(c.id);
      }
    });

    // Find roots (commits with no parent)
    const roots = repo.commits.filter(c => !c.parentId);
    
    // Assign coordinates
    const layout: (Commit & { x: number; y: number })[] = [];
    const visited = new Set<string>();
    
    // Helper to traverse
    const traverse = (commit: Commit, x: number, y: number) => {
      if (visited.has(commit.id)) return;
      visited.add(commit.id);

      layout.push({ ...commit, x, y });

      const children = childrenMap[commit.id] || [];
      children.forEach((childId, index) => {
        const child = repo.commits.find(c => c.id === childId);
        if (child) {
          // Improve branching visualization
          // If multiple children, spread them out vertically
          const newY = index === 0 ? y : y + 60; 
          traverse(child, x + 80, newY);
        }
      });
    };

    roots.forEach((root, i) => traverse(root, 60, 60 + i * 60));

    return layout;
  }, [repo]);

  if (!repo) return null;

  return (
    <div className="flex-1 bg-zinc-900/50 p-4 border-l border-green-900/30 min-h-[300px] relative overflow-hidden">
      <div className="absolute top-4 right-4 text-xs text-zinc-500 uppercase tracking-widest">Commit Graph</div>
      
      <svg className="w-full h-full">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(74, 222, 128, 0.1)" strokeWidth="1"/>
          </pattern>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="16" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#4ade80" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Edges */}
        {nodes.map((node) => {
          if (!node.parentId) return null;
          const parent = nodes.find(n => n.id === node.parentId);
          if (!parent) return null;

          return (
            <motion.line
              key={`edge-${node.id}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              x1={parent.x}
              y1={parent.y}
              x2={node.x}
              y2={node.y}
              stroke="#4ade80"
              strokeWidth="2"
              strokeOpacity="0.5"
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.g 
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            layout // Animate position changes (e.g. rebase)
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setSelectedCommit(node.id === selectedCommit ? null : node.id)}
            className="cursor-pointer"
          >
            <circle 
              cx={node.x} 
              cy={node.y} 
              r="8" 
              fill={selectedCommit === node.id ? "#22c55e" : "#18181b"} 
              stroke="#4ade80" 
              strokeWidth="2" 
            />
            
            {/* Commit Hash Label */}
            <text x={node.x} y={node.y + 25} textAnchor="middle" className="text-[10px] fill-zinc-500 font-mono select-none">
              {node.id.substring(0, 6)}
            </text>

            {/* Message Tooltip (always visible if selected, otherwise on hover logic could be added but click is better for touch) */}
            <AnimatePresence>
              {selectedCommit === node.id && (
                <motion.g
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <rect x={node.x - 60} y={node.y - 45} width="120" height="30" rx="4" fill="#18181b" stroke="#4ade80" strokeWidth="1" />
                  <text x={node.x} y={node.y - 26} textAnchor="middle" className="text-[10px] fill-green-400 font-mono">
                    {node.message}
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
            
            {/* Branch Labels */}
            {repo.branches.map(b => b.commitId === node.id && (
               <g key={b.name} transform={`translate(${node.x}, ${node.y - (selectedCommit === node.id ? 60 : 35)})`}>
                 <rect x="-25" y="-12" width="50" height="16" rx="4" fill="#4ade80" />
                 <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-black font-bold">
                   {b.name}
                 </text>
                 {repo.head === b.name && (
                    <text x="0" y="-18" textAnchor="middle" className="text-[9px] fill-yellow-400 font-bold">HEAD</text>
                 )}
               </g>
            ))}
          </motion.g>
        ))}
      </svg>
      
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
          No commits yet. Run 'git init' to start.
        </div>
      )}
    </div>
  );
};
