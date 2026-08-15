import { useState, useEffect, useCallback } from 'react';

type Grid = number[][];
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 4;

export function use2048() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  
  // Track high score in local storage temporarily (DB logic handled at app level)
  const [bestScore, setBestScore] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('2048-best');
    if (saved) setBestScore(parseInt(saved, 10));
    resetGame();
  }, []);

  function createEmptyGrid(): Grid {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  }

  function addRandomTile(currentGrid: Grid): Grid {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    
    if (emptyCells.length === 0) return currentGrid;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    // 90% chance of 2, 10% chance of 4
    newGrid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }

  const resetGame = useCallback(() => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  }, []);

  const move = useCallback((direction: Direction) => {
    if (gameOver || gameWon) return;

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map(row => [...row]);
      let moved = false;
      let newScore = score;

      const slideAndMerge = (line: number[]) => {
        // Remove zeros
        let filtered = line.filter(val => val !== 0);
        
        // Merge
        for (let i = 0; i < filtered.length - 1; i++) {
          if (filtered[i] !== 0 && filtered[i] === filtered[i + 1]) {
            filtered[i] *= 2;
            newScore += filtered[i];
            filtered.splice(i + 1, 1);
          }
        }
        
        // Pad with zeros
        while (filtered.length < GRID_SIZE) {
          filtered.push(0);
        }
        return filtered;
      };

      if (direction === 'LEFT' || direction === 'RIGHT') {
        for (let r = 0; r < GRID_SIZE; r++) {
          const row = newGrid[r];
          const originalRow = [...row];
          
          if (direction === 'RIGHT') row.reverse();
          
          const newRow = slideAndMerge(row);
          if (direction === 'RIGHT') newRow.reverse();
          
          newGrid[r] = newRow;
          
          if (JSON.stringify(originalRow) !== JSON.stringify(newGrid[r])) {
            moved = true;
          }
        }
      } else if (direction === 'UP' || direction === 'DOWN') {
        for (let c = 0; c < GRID_SIZE; c++) {
          const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          const originalCol = [...col];
          
          if (direction === 'DOWN') col.reverse();
          
          const newCol = slideAndMerge(col);
          if (direction === 'DOWN') newCol.reverse();
          
          for (let r = 0; r < GRID_SIZE; r++) {
            newGrid[r][c] = newCol[r];
          }
          
          if (JSON.stringify(originalCol) !== JSON.stringify([newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]])) {
            moved = true;
          }
        }
      }

      if (moved) {
        setScore(newScore);
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('2048-best', newScore.toString());
        }

        const gridWithNewTile = addRandomTile(newGrid);
        
        // Check win (2048)
        let won = false;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (gridWithNewTile[r][c] === 2048) won = true;
          }
        }
        if (won && !gameWon) setGameWon(true);

        // Check game over
        let isGameOver = true;
        // Check for empty cells
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (gridWithNewTile[r][c] === 0) isGameOver = false;
          }
        }
        // Check for possible merges
        if (isGameOver) {
          for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
              const val = gridWithNewTile[r][c];
              if (
                (c < GRID_SIZE - 1 && gridWithNewTile[r][c+1] === val) ||
                (r < GRID_SIZE - 1 && gridWithNewTile[r+1][c] === val)
              ) {
                isGameOver = false;
                break;
              }
            }
          }
        }
        
        if (isGameOver) setGameOver(true);
        
        return gridWithNewTile;
      }
      
      return prevGrid;
    });
  }, [gameOver, gameWon, score, bestScore]);

  return {
    grid,
    score,
    bestScore,
    gameOver,
    gameWon,
    move,
    resetGame,
    setGameWon // Allow continuing after win
  };
}
