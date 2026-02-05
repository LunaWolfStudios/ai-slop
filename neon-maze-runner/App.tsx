import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GridCell } from './components/GridCell';
import { GameOverlay } from './components/GameOverlay';
import { Coordinate, CellType, GamePhase, GameConfig } from './types';
import { findPath, generateGrid, isValidPos } from './utils/pathfinding';
import { Timer, Hammer, Zap, AlertTriangle } from 'lucide-react';

const CONFIG: GameConfig = {
  gridSize: 12,
  buildTimeSeconds: 30,
  initialResources: 25,
  obstacleCount: 15,
};

const START_POS: Coordinate = { x: 5, y: 11 };
const END_POS: Coordinate = { x: 6, y: 0 };

// Animation speed for the monster (ms per step)
const STEP_DELAY = 300; 

const App: React.FC = () => {
  // Game State
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [resources, setResources] = useState(0);
  const [timer, setTimer] = useState(0);
  const [monsterPos, setMonsterPos] = useState<Coordinate>(START_POS);
  const [score, setScore] = useState(0);
  const [currentPath, setCurrentPath] = useState<Coordinate[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Refs for loop management
  const moveIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize Game
  const initGame = useCallback(() => {
    const newGrid = generateGrid(CONFIG.gridSize, CONFIG.obstacleCount, START_POS, END_POS);
    setGrid(newGrid);
    setResources(CONFIG.initialResources);
    setTimer(CONFIG.buildTimeSeconds);
    setMonsterPos({ ...START_POS });
    setScore(0);
    setPhase(GamePhase.BUILD);
    setFeedback(null);
    
    // Initial path calculation
    const path = findPath(newGrid, START_POS, END_POS, CONFIG.gridSize);
    if (path) setCurrentPath(path);
  }, []);

  // Handle Cell Click (Building)
  const handleCellClick = (x: number, y: number) => {
    if (phase !== GamePhase.BUILD) return;

    // Validation
    if (x === START_POS.x && y === START_POS.y) return;
    if (x === END_POS.x && y === END_POS.y) return;
    if (grid[y][x] === CellType.OBSTACLE) return;

    // Toggle logic
    const isWall = grid[y][x] === CellType.WALL;

    if (!isWall && resources <= 0) {
        triggerFeedback("No resources!");
        return;
    }

    const newType = isWall ? CellType.EMPTY : CellType.WALL;
    
    // Optimistic Update Check
    const tempGrid = grid.map(row => [...row]);
    tempGrid[y][x] = newType;

    const newPath = findPath(tempGrid, START_POS, END_POS, CONFIG.gridSize);

    if (!newPath) {
      triggerFeedback("Cannot block the path!");
      return;
    }

    // Apply Update
    setGrid(tempGrid);
    setCurrentPath(newPath);
    setResources(prev => isWall ? prev + 1 : prev - 1);
  };

  const triggerFeedback = (msg: string) => {
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 1500);
  };

  // Build Phase Timer
  useEffect(() => {
    let interval: number;
    if (phase === GamePhase.BUILD) {
      interval = window.setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setPhase(GamePhase.RUN);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  // Run Phase Logic
  useEffect(() => {
    if (phase === GamePhase.RUN) {
      // Calculate final full path one last time to be safe
      const fullPath = findPath(grid, START_POS, END_POS, CONFIG.gridSize);
      
      if (!fullPath || fullPath.length === 0) {
        // Should not happen if build logic is sound, but failsafe
        setPhase(GamePhase.RESULT);
        return;
      }

      let stepIndex = 0;
      // The path includes start, so we start moving to index 1 immediately or handle index 0 as start
      // fullPath[0] is start. 
      
      startTimeRef.current = Date.now();

      moveIntervalRef.current = window.setInterval(() => {
        stepIndex++;
        if (stepIndex < fullPath.length) {
          setMonsterPos(fullPath[stepIndex]);
          // Calculate score based on steps or actual time? Prompt says "How long it took".
          // We can update a live timer here if we want, or just calc at end.
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setScore(elapsed);
        } else {
          // Reached end
          if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
          setPhase(GamePhase.RESULT);
        }
      }, STEP_DELAY);
    }

    return () => {
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    };
  }, [phase, grid]);


  // Helper to check if a cell is in the current path
  const isCellInPath = (x: number, y: number) => {
    return currentPath.some(p => p.x === x && p.y === y);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative font-sans select-none">
      
      <GameOverlay 
        phase={phase} 
        score={score} 
        onStart={initGame} 
        onRestart={initGame} 
      />

      {/* Header / HUD */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-lg backdrop-blur-sm">
        
        {/* Resources */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${resources === 0 ? 'bg-red-900/50 text-red-400' : 'bg-cyan-900/30 text-cyan-400'}`}>
            <Hammer className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Resources</span>
            <span className="text-2xl font-bold digit-font leading-none">{resources}</span>
          </div>
        </div>

        {/* Timer / Phase Status */}
        <div className="flex flex-col items-end">
           {phase === GamePhase.BUILD ? (
             <div className="flex items-center gap-3">
                <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block">Build Time</span>
                    <span className={`text-2xl font-bold digit-font leading-none ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timer}s
                    </span>
                </div>
                <div className="p-2 rounded-lg bg-indigo-900/30 text-indigo-400">
                    <Timer className="w-6 h-6" />
                </div>
             </div>
           ) : phase === GamePhase.RUN ? (
             <div className="flex items-center gap-2 text-emerald-400">
                <span className="animate-pulse font-bold tracking-widest">RUNNING</span>
                <Zap className="w-5 h-5 fill-current" />
             </div>
           ) : (
             <div className="text-slate-500 font-bold">--:--</div>
           )}
        </div>
      </div>

      {/* Error/Feedback Toast */}
      <div className={`
         absolute top-24 z-50 bg-red-500/90 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2
         transition-all duration-300 transform
         ${feedback ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}>
          <AlertTriangle className="w-4 h-4" /> {feedback}
      </div>

      {/* Game Board Container */}
      <div className="relative p-1 bg-slate-800 rounded-lg shadow-2xl ring-1 ring-slate-700">
        
        {/* The Grid */}
        <div 
          className="grid gap-1 bg-slate-900 p-1 rounded"
          style={{ 
            gridTemplateColumns: `repeat(${CONFIG.gridSize}, minmax(0, 1fr))`,
            width: 'min(90vw, 500px)',
            height: 'min(90vw, 500px)'
          }}
        >
          {grid.map((row, y) => (
            row.map((cellType, x) => (
              <GridCell
                key={`${x}-${y}`}
                x={x}
                y={y}
                type={cellType}
                isPath={phase === GamePhase.BUILD && isCellInPath(x, y)}
                onClick={handleCellClick}
              />
            ))
          ))}
        </div>

        {/* The Monster Layer */}
        {phase !== GamePhase.MENU && (
          <div 
            className="absolute pointer-events-none transition-all duration-300 ease-linear z-20"
            style={{
              // Calculations to align the monster overlay perfectly with the grid cells
              // Grid padding is 0.5rem (p-2 in parent) + 0.25rem (p-1 in grid) approx
              // We use percentages for responsiveness
              width: `${100 / CONFIG.gridSize}%`,
              height: `${100 / CONFIG.gridSize}%`,
              left: `${(monsterPos.x / CONFIG.gridSize) * 100}%`,
              top: `${(monsterPos.y / CONFIG.gridSize) * 100}%`,
            }}
          >
             <div className="w-full h-full p-1">
                <div className="w-full h-full bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981] flex items-center justify-center animate-pulse-glow relative">
                   <div className="w-2/3 h-2/3 border-2 border-emerald-200 rounded-full opacity-50" />
                   {/* Eyes */}
                   <div className="absolute top-[30%] left-[25%] w-[15%] h-[15%] bg-black rounded-full" />
                   <div className="absolute top-[30%] right-[25%] w-[15%] h-[15%] bg-black rounded-full" />
                </div>
             </div>
          </div>
        )}

      </div>
      
      {/* Footer / Instructions */}
      <div className="mt-6 text-center text-slate-500 text-sm max-w-md">
        {phase === GamePhase.BUILD && (
            <p>Click empty cells to build walls. Create the longest path possible.</p>
        )}
        {phase === GamePhase.RUN && (
            <p>Watch the runner navigate your maze!</p>
        )}
      </div>

    </div>
  );
};

export default App;