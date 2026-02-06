import { Grid, PieceType, Player, Coordinates, CellData, ActionType } from '../types';
import { createEmptyCell, MAX_HEALTH } from '../constants';

// --- Board Manipulation ---

export const expandGrid = (grid: Grid, index: number, isRow: boolean): Grid => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell }))); // Deep copy

  if (isRow) {
    // Add a new row at index
    const cols = newGrid[0].length;
    const newRow = Array(cols).fill(null).map(() => createEmptyCell());
    newGrid.splice(index, 0, newRow);
  } else {
    // Add a new column at index for every row
    newGrid.forEach(row => {
      row.splice(index, 0, createEmptyCell());
    });
  }

  return newGrid;
};

// --- Win Detection ---

const DIRECTIONS = [
  [0, 1],   // Horizontal
  [1, 0],   // Vertical
  [1, 1],   // Diagonal Down-Right
  [1, -1]   // Diagonal Down-Left
];

export const checkWin = (grid: Grid): { winner: Player | null, winningCells: Coordinates[] } => {
  const rows = grid.length;
  if (rows === 0) return { winner: null, winningCells: [] };
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell.type === PieceType.X || cell.type === PieceType.O) {
        const player = cell.type as Player;

        for (const [dr, dc] of DIRECTIONS) {
          // Check for 3 in a row
          const p1 = { r, c };
          const p2 = { r: r + dr, c: c + dc };
          const p3 = { r: r + 2 * dr, c: c + 2 * dc };

          if (isValid(p2, rows, cols) && isValid(p3, rows, cols)) {
            const cell2 = grid[p2.r][p2.c];
            const cell3 = grid[p3.r][p3.c];

            if (cell2.type === player && cell3.type === player) {
              return {
                winner: player,
                winningCells: [p1, p2, p3]
              };
            }
          }
        }
      }
    }
  }

  return { winner: null, winningCells: [] };
};

const isValid = (p: Coordinates, rows: number, cols: number): boolean => {
  return p.r >= 0 && p.r < rows && p.c >= 0 && p.c < cols;
};

// --- AI Logic (Simple Greedy) ---

export const getAIMove = (grid: Grid, player: Player, availableMoves: typeof import('../constants').MOVES): { moveId: string, actions: { type: ActionType, target: any }[] } => {
  // 1. Check if AI can win immediately (Placement)
  const rows = grid.length;
  const cols = grid[0].length;

  // Simple heuristic: Try to find a spot that creates a win
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === PieceType.EMPTY) {
        // Simulate placing token
        const tempGrid = JSON.parse(JSON.stringify(grid));
        tempGrid[r][c].type = player;
        if (checkWin(tempGrid).winner === player) {
           return {
             moveId: 'basic-token',
             actions: [{ type: ActionType.PLACE_TOKEN, target: { r, c } }]
           };
        }
      }
    }
  }

  // 2. Block opponent win (Placement)
  const opponent = player === 'X' ? 'O' : 'X';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === PieceType.EMPTY) {
        const tempGrid = JSON.parse(JSON.stringify(grid));
        tempGrid[r][c].type = opponent;
        if (checkWin(tempGrid).winner === opponent) {
           // Priority block with token or triangle
           return {
             moveId: 'block-triangle',
             actions: [
               { type: ActionType.PLACE_TRIANGLE, target: { r, c } },
               { type: ActionType.PLACE_TRIANGLE, target: null } // Waste second triangle or place random
             ]
           };
        }
      }
    }
  }

  // 3. Random Valid Move
  // Prioritize Token > Triangle > Expand
  
  // Try to place token near existing pieces
  const emptyCells: Coordinates[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === PieceType.EMPTY) {
        emptyCells.push({ r, c });
      }
    }
  }

  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return {
      moveId: 'basic-token',
      actions: [{ type: ActionType.PLACE_TOKEN, target: randomCell }]
    };
  }

  // Fallback: Expand board if no empty cells (unlikely with infinite logic, but safe fallback)
  return {
    moveId: 'expand',
    actions: [{ type: ActionType.DRAW_LINE, target: { index: rows, isRow: true } }] 
  };
};
