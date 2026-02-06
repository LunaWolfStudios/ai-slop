import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import ControlPanel from './components/ControlPanel';
import GameInfo from './components/GameInfo';
import { 
  GameState, 
  Player, 
  PieceType, 
  ActionType, 
  ActionConfig, 
  CellData,
  Coordinates,
  HistoryEntry
} from './types';
import { INITIAL_GRID, MOVES, MAX_HEALTH, CELL_SIZE } from './constants';
import { expandGrid, checkWin, getAIMove } from './utils/gameLogic';
import { Info, RotateCcw, Users, Bot, Expand, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const App: React.FC = () => {
  // Game Configuration
  const [gameMode, setGameMode] = useState<'PvP' | 'PvAI'>('PvAI');
  
  // Game State
  const [grid, setGrid] = useState<CellData[][]>(INITIAL_GRID);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [turnCount, setTurnCount] = useState(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCells, setWinningCells] = useState<Coordinates[]>([]);
  
  // Stats & History
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sessionWins, setSessionWins] = useState<{ X: number, O: number }>({ X: 0, O: 0 });

  // Turn State
  const [remainingActions, setRemainingActions] = useState<Partial<Record<ActionType, number>>>({});
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [currentActionType, setCurrentActionType] = useState<ActionType | null>(null);
  const [hasActedInTurn, setHasActedInTurn] = useState(false);

  // View State
  const [zoomLevel, setZoomLevel] = useState(1);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // UI State
  const [showTutorial, setShowTutorial] = useState(true);

  // --- Helpers ---

  const switchTurn = () => {
    setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
    setTurnCount(prev => prev + 1);
    setRemainingActions({});
    setCurrentConfigId(null);
    setCurrentActionType(null);
    setHasActedInTurn(false);
  };

  const logAction = (description: string) => {
      setHistory(prev => [...prev, {
          turn: turnCount,
          player: currentPlayer,
          description
      }]);
  };

  const updateActionState = (type: ActionType) => {
    setHasActedInTurn(true); // Mark that user has started acting, locking config selection

    setRemainingActions(prev => {
      const next = { ...prev };
      if (next[type] && next[type]! > 0) {
        next[type]!--;
      }
      
      // Check if any sub-action of this specific type remains. 
      // If not, try to switch to another available type automatically, 
      // but only if the current type is exhausted.
      if (next[type] === 0) {
         const remainingTypes = Object.keys(next).filter(k => next[k as ActionType]! > 0) as ActionType[];
         if (remainingTypes.length > 0) {
             setCurrentActionType(remainingTypes[0]);
         } else {
             // End turn if absolutely nothing left
             setTimeout(switchTurn, 200);
         }
      }

      return next;
    });
  };

  const triggerErrorFlash = (r: number, c: number) => {
    setGrid(prev => {
        const newGrid = prev.map(row => row.map(cell => ({...cell})));
        if (newGrid[r] && newGrid[r][c]) {
            newGrid[r][c].flashError = true;
        }
        return newGrid;
    });

    setTimeout(() => {
        setGrid(prev => {
            const newGrid = prev.map(row => row.map(cell => ({...cell})));
            if (newGrid[r] && newGrid[r][c]) {
                newGrid[r][c].flashError = false;
            }
            return newGrid;
        });
    }, 500);
  };

  const adjustZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.2), 2.0));
  };

  const fitToScreen = () => {
    if (!boardContainerRef.current) return;

    const rows = grid.length;
    const cols = grid[0].length;
    
    // Calculate estimated board size based on constants (approx)
    // Label(30) + (cols * CELL_SIZE) + gaps/padding
    const boardWidthPx = 30 + (cols * CELL_SIZE) + (cols * 4) + 60; // +60 for safety padding
    const boardHeightPx = 30 + (rows * CELL_SIZE) + (rows * 4) + 60;

    const containerWidth = boardContainerRef.current.clientWidth;
    const containerHeight = boardContainerRef.current.clientHeight;

    // Calculate scale to fit
    const scaleX = containerWidth / boardWidthPx;
    const scaleY = containerHeight / boardHeightPx;
    
    // Choose smaller scale to ensure fit, clamp between 0.2 and 1.5
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.2), 1.5);

    setZoomLevel(newZoom);
    
    // Center scroll after a brief delay to allow React to render scaling
    setTimeout(() => {
        if(boardContainerRef.current) {
             const { scrollWidth, scrollHeight, clientWidth, clientHeight } = boardContainerRef.current;
             boardContainerRef.current.scrollTo({
                 left: (scrollWidth - clientWidth) / 2,
                 top: (scrollHeight - clientHeight) / 2,
                 behavior: 'smooth'
             });
        }
    }, 50);
  };

  // Center board on initial load
  useEffect(() => {
      // Small delay to ensure DOM is ready
      setTimeout(fitToScreen, 100);
  }, []);

  // --- Interaction Handlers ---

  const handleSelectAction = (config: ActionConfig) => {
    if (hasActedInTurn) return; // Prevention double-check, though button is disabled

    setCurrentConfigId(config.id);
    setRemainingActions({ ...config.cost });
    
    // Set initial action type
    const firstType = Object.keys(config.cost)[0] as ActionType;
    setCurrentActionType(firstType);
  };

  const handleSetActionType = (type: ActionType) => {
      if (remainingActions[type] && remainingActions[type]! > 0) {
          setCurrentActionType(type);
      }
  };

  const handleEndTurn = () => {
      if (!hasActedInTurn) {
          logAction("Passed Turn");
      }
      switchTurn();
  };

  const handleCellClick = (r: number, c: number) => {
    if (winner || !currentActionType) return;
    
    const cell = grid[r][c];
    
    // Logic based on current action type
    let actionSuccess = false;
    let error = false;
    let logMsg = '';
    const newGrid = grid.map(row => row.map(c => ({...c})));

    switch (currentActionType) {
      case ActionType.PLACE_TOKEN:
        // Rule: P1 cannot place first token in center of 3x3
        if (turnCount === 1 && currentPlayer === 'X' && r === 1 && c === 1 && grid.length === 3 && grid[0].length === 3) {
            triggerErrorFlash(r, c);
            error = true;
        } else if (cell.type === PieceType.EMPTY) {
            newGrid[r][c].type = currentPlayer === 'X' ? PieceType.X : PieceType.O;
            actionSuccess = true;
            logMsg = `Placed Token at (${r+1},${c+1})`;
        }
        break;

      case ActionType.PLACE_TRIANGLE:
        if (cell.isDotProtected) {
            triggerErrorFlash(r, c);
            error = true;
        } else if (cell.type === PieceType.EMPTY) {
            newGrid[r][c].type = PieceType.TRIANGLE;
            actionSuccess = true;
            logMsg = `Placed Triangle at (${r+1},${c+1})`;
        }
        break;

      case ActionType.PLACE_RECTANGLE:
        if (cell.isDotProtected) {
            triggerErrorFlash(r, c);
            error = true;
        } else if (cell.type === PieceType.EMPTY) {
            newGrid[r][c].type = PieceType.RECTANGLE;
            newGrid[r][c].health = MAX_HEALTH;
            actionSuccess = true;
            logMsg = `Placed Rect at (${r+1},${c+1})`;
        }
        break;
        
      case ActionType.PLACE_DOT:
        if (cell.type === PieceType.EMPTY) {
             newGrid[r][c].isDotProtected = true; 
             actionSuccess = true;
             logMsg = `Placed Dot at (${r+1},${c+1})`;
        }
        break;

      case ActionType.DESTROY:
        if (cell.type === PieceType.RECTANGLE) {
            newGrid[r][c].health -= 1; 
            if (newGrid[r][c].health <= 0) {
                newGrid[r][c].type = PieceType.EMPTY;
                newGrid[r][c].health = 0;
                logMsg = `Destroyed Rect at (${r+1},${c+1})`;
            } else {
                logMsg = `Damaged Rect at (${r+1},${c+1})`;
            }
            actionSuccess = true;
        }
        break;

      default:
        break;
    }

    if (error) return; 

    if (actionSuccess) {
        setGrid(newGrid);
        logAction(logMsg);
        
        // Check Win immediately after token placement
        if (currentActionType === ActionType.PLACE_TOKEN) {
            const winResult = checkWin(newGrid);
            if (winResult.winner) {
                setWinner(winResult.winner);
                setWinningCells(winResult.winningCells);
                setSessionWins(prev => ({ ...prev, [winResult.winner!]: prev[winResult.winner!] + 1 }));
                setRemainingActions({}); // End turn immediately
                return; 
            }
        }
        
        updateActionState(currentActionType);
    }
  };

  const handleLineClick = (index: number, isRow: boolean) => {
      if (winner || currentActionType !== ActionType.DRAW_LINE) return;

      const newGrid = expandGrid(grid, index, isRow);
      setGrid(newGrid);
      logAction(`Drew Line ${isRow ? 'Row' : 'Col'} ${index + 1}`);
      
      const winResult = checkWin(newGrid);
      if (winResult.winner) {
         setWinner(winResult.winner);
         setWinningCells(winResult.winningCells);
         setSessionWins(prev => ({ ...prev, [winResult.winner!]: prev[winResult.winner!] + 1 }));
         setRemainingActions({});
         return;
      }

      updateActionState(ActionType.DRAW_LINE);
  };

  // --- AI Loop ---
  useEffect(() => {
    if (gameMode === 'PvAI' && currentPlayer === 'O' && !winner) {
        const timer = setTimeout(() => {
            const aiMove = getAIMove(grid, 'O', MOVES);
            const config = MOVES.find(m => m.id === aiMove.moveId);
            if (!config) return;

            let currentGrid = grid.map(row => row.map(c => ({...c})));
            let won = false;
            let winCells: Coordinates[] = [];
            const aiLog: string[] = [];

            aiMove.actions.forEach(act => {
                if (won) return;

                const { r, c } = act.target || {r:0, c:0};

                if (act.type === ActionType.PLACE_TOKEN) {
                    currentGrid[r][c].type = PieceType.O;
                    aiLog.push(`Placed Token (${r+1},${c+1})`);
                } else if (act.type === ActionType.PLACE_TRIANGLE) {
                    if (act.target && currentGrid[r][c].type === PieceType.EMPTY) {
                        currentGrid[r][c].type = PieceType.TRIANGLE;
                        aiLog.push(`Placed Triangle (${r+1},${c+1})`);
                    }
                } else if (act.type === ActionType.DRAW_LINE) {
                    const { index, isRow } = act.target;
                    currentGrid = expandGrid(currentGrid, index, isRow);
                    aiLog.push(`Drew Line`);
                }

                const w = checkWin(currentGrid);
                if (w.winner) {
                    won = true;
                    setWinner(w.winner);
                    winCells = w.winningCells;
                    setSessionWins(prev => ({ ...prev, [w.winner!]: prev[w.winner!] + 1 }));
                }
            });

            setGrid(currentGrid);
            // Batch log AI moves
            setHistory(prev => [...prev, ...aiLog.map(desc => ({ turn: turnCount, player: 'O' as Player, description: desc }))]);

            if (won) {
                setWinningCells(winCells);
            } else {
                switchTurn();
            }

        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, winner, grid]); // Dependencies

  // --- Reset ---
  const resetGame = () => {
    setGrid(Array(3).fill(null).map(() => Array(3).fill(null).map(() => ({
        type: PieceType.EMPTY,
        id: Math.random().toString(36).substr(2, 9),
        health: 0,
        isDotProtected: false,
    }))));
    setCurrentPlayer('X');
    setTurnCount(1);
    setWinner(null);
    setWinningCells([]);
    setRemainingActions({});
    setCurrentConfigId(null);
    setHasActedInTurn(false);
    setHistory([]);
    fitToScreen(); // Reset Zoom
  };

  return (
    <div className="relative w-screen h-screen bg-gray-950 overflow-hidden flex flex-col font-sans">
      
      {/* Header / HUD */}
      <header className="absolute top-0 left-0 w-full p-2 md:p-4 flex justify-between items-center z-40 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                HARDCORE <span className="text-neon-blue">TIC</span> <span className="text-neon-pink">TAC</span> <span className="text-neon-green">TOE</span>
            </h1>
        </div>
        <div className="flex gap-2 md:gap-4 pointer-events-auto">
             <button onClick={() => setGameMode(m => m === 'PvP' ? 'PvAI' : 'PvP')} className="flex items-center gap-2 bg-gray-800 text-white px-2 py-1 md:px-3 md:py-1 rounded hover:bg-gray-700 border border-gray-600 text-xs md:text-sm">
                {gameMode === 'PvP' ? <Users size={14}/> : <Bot size={14}/>}
                {gameMode}
             </button>
             <button onClick={resetGame} className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 border border-gray-600">
                <RotateCcw size={16} />
             </button>
             <button onClick={() => setShowTutorial(true)} className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 border border-gray-600">
                <Info size={16} />
             </button>
        </div>
      </header>

      <GameInfo 
        turnCount={turnCount}
        sessionWins={sessionWins}
        history={history}
        currentPlayer={currentPlayer}
      />

      {/* Manual Zoom Controls */}
      <div className="fixed top-20 left-4 z-40 flex flex-col gap-2 pointer-events-auto">
          <button onClick={() => adjustZoom(0.1)} className="bg-gray-900/80 text-white p-2 rounded border border-gray-700 hover:bg-gray-800">
              <ZoomIn size={20} />
          </button>
          <button onClick={fitToScreen} className="bg-gray-900/80 text-white p-2 rounded border border-gray-700 hover:bg-gray-800" title="Fit Board to Screen">
              <Maximize size={20} />
          </button>
          <button onClick={() => adjustZoom(-0.1)} className="bg-gray-900/80 text-white p-2 rounded border border-gray-700 hover:bg-gray-800">
              <ZoomOut size={20} />
          </button>
      </div>

      {/* Main Game Area with Pan/Zoom */}
      <main 
         ref={boardContainerRef}
         className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] relative flex items-center justify-center cursor-move"
         onMouseDown={(e) => {
             // Simple drag to scroll implementation
             const ele = boardContainerRef.current;
             if (!ele) return;
             
             // Check if clicking on board content or just background
             // For simplicity, we just enable scrolling on container natively
             // Mouse drag scrolling helper:
             let pos = { left: ele.scrollLeft, top: ele.scrollTop, x: e.clientX, y: e.clientY };
             
             const mouseMoveHandler = (e: MouseEvent) => {
                 const dx = e.clientX - pos.x;
                 const dy = e.clientY - pos.y;
                 ele.scrollTop = pos.top - dy;
                 ele.scrollLeft = pos.left - dx;
             };
             
             const mouseUpHandler = () => {
                 document.removeEventListener('mousemove', mouseMoveHandler);
                 document.removeEventListener('mouseup', mouseUpHandler);
                 ele.style.cursor = 'grab';
             };
             
             ele.style.cursor = 'grabbing';
             document.addEventListener('mousemove', mouseMoveHandler);
             document.addEventListener('mouseup', mouseUpHandler);
         }}
      >
         <div 
            className="p-20 transition-transform duration-200 ease-out origin-center"
            style={{ 
                transform: `scale(${zoomLevel})`,
            }}
         >
            <Board 
                grid={grid} 
                onCellClick={handleCellClick} 
                onLineClick={handleLineClick}
                selectedAction={currentActionType}
                winningCells={winningCells}
            />
         </div>
      </main>

      {/* Controls */}
      <ControlPanel 
         currentPlayer={currentPlayer}
         onSelectAction={handleSelectAction}
         onSetActionType={handleSetActionType}
         onEndTurn={handleEndTurn}
         remainingActions={remainingActions}
         currentTurnConfigId={currentConfigId}
         currentActionType={currentActionType}
         turnCount={turnCount}
         hasActed={hasActedInTurn}
      />

      {/* Winner Overlay */}
      {winner && (
        <div className="absolute inset-x-0 bottom-0 z-[60] flex flex-col items-center justify-end pointer-events-none">
            <div className="w-full max-w-lg mb-20 p-6 bg-gray-900/90 border-t-4 border-neon-green backdrop-blur-md rounded-t-3xl text-center shadow-[0_-10px_50px_rgba(0,0,0,0.8)] pointer-events-auto animate-in slide-in-from-bottom-20 duration-500">
                <h2 className="text-5xl font-black mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {winner === 'X' ? <span className="text-neon-blue">PLAYER X</span> : <span className="text-neon-pink">PLAYER O</span>}
                </h2>
                <h3 className="text-3xl text-neon-green mb-6 font-bold tracking-widest">VICTORY</h3>
                <div className="flex justify-center gap-4">
                    <button onClick={resetGame} className="px-8 py-3 bg-neon-green text-black font-bold text-xl rounded hover:bg-white transition-colors hover:scale-105 transform duration-100">
                        PLAY AGAIN
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
             <div className="max-w-2xl bg-gray-900 border border-gray-700 rounded-lg p-6 text-gray-300 shadow-2xl">
                 <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">How to Play</h2>
                 <div className="space-y-4 mb-6 h-96 overflow-y-auto pr-2">
                     <p><strong>Objective:</strong> Get 3 Win Tokens (X or O) in a row. Horizontally, Vertically, or Diagonally.</p>
                     
                     <div className="p-3 bg-gray-800 rounded">
                        <h4 className="text-neon-blue font-bold">1. Infinite Board</h4>
                        <p className="text-sm">Use the <Expand size={14} className="inline"/> <strong>Expand</strong> tool to draw lines. Drawing a line adds a new row or column, pushing existing pieces apart.</p>
                     </div>

                     <div className="p-3 bg-gray-800 rounded">
                        <h4 className="text-neon-yellow font-bold">2. Blocking</h4>
                        <p className="text-sm">Place <strong>Triangles</strong> (Permanent) or <strong>Rectangles</strong> (Destructible) to block your opponent.</p>
                     </div>

                     <div className="p-3 bg-gray-800 rounded">
                        <h4 className="text-neon-pink font-bold">3. Destruction</h4>
                        <p className="text-sm">Rectangles can be destroyed. Use the Destroy tool to chip away their health.</p>
                     </div>
                     
                     <div className="p-3 bg-gray-800 rounded">
                        <h4 className="text-indigo-400 font-bold">4. Dots</h4>
                        <p className="text-sm">Place Dots on empty cells. These cells allow Win Tokens but CANNOT be blocked by Triangles or Rectangles.</p>
                     </div>

                     <div className="p-3 bg-gray-800 rounded border border-gray-600">
                        <h4 className="text-white font-bold">Combos & Flexibility</h4>
                        <p className="text-sm">You can change your selected tool as long as you haven't used it yet. You can perform combo actions in any order. You can end your turn early at any time.</p>
                     </div>
                 </div>
                 <button onClick={() => setShowTutorial(false)} className="w-full py-3 bg-white text-black font-bold rounded hover:bg-gray-200">
                     GOT IT
                 </button>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;