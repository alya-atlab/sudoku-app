import React, { useState, useEffect } from 'react';
import SudokuCell from './SudokuCell';
import './SudokuGrid.css';

interface SudokuGridProps {
  initialGrid: number[][];
  solutionGrid: number[][];
  onNewGame: () => void;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ initialGrid, solutionGrid, onNewGame }) => {
  const [grid, setGrid] = useState<number[][]>(() => initialGrid.map(row => [...row]));
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [correctCells, setCorrectCells] = useState<Set<string>>(new Set());
  const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());
  const [isEditable] = useState<boolean[][]>(() => 
    initialGrid.map(row => row.map(cell => cell === 0))
  );

  useEffect(() => {
    setGrid(initialGrid.map(row => [...row]));
    setIsGameOver(false);
    setIsCompleted(false);
    setScore(0);
    setTime(0);
    setMistakes(0);
    setCorrectCells(new Set());
    setIncorrectCells(new Set());
  }, [initialGrid]);

  useEffect(() => {
    if (isGameOver || isCompleted) return;
    const interval = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isCompleted]);

  const playSound = (correct: boolean) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = correct ? 1200 : 600;
    gainNode.gain.value = correct ? 0.05 : 0.1;
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(now + 0.02);
  };

  const isValidMove = (row: number, col: number, value: number): boolean => {
    return value === solutionGrid[row][col];
  };

  const checkCompletion = () => {
    return grid.every((row, i) => row.every((cell, j) => cell === solutionGrid[i][j]));
  };

  const handleChange = (row: number, col: number, value: string) => {
    if (isGameOver || !isEditable[row][col]) return;

    const newCorrect = new Set(correctCells);
    const newIncorrect = new Set(incorrectCells);
    const cellKey = `${row}-${col}`;

    newCorrect.delete(cellKey);
    newIncorrect.delete(cellKey);

    if (/^[1-9]$/.test(value)) {
      const numValue = Number(value);
      const newGrid = [...grid];
      newGrid[row][col] = numValue;
      setGrid(newGrid);

      if (isValidMove(row, col, numValue)) {
        newCorrect.add(cellKey);
        playSound(true);
        setScore(prev => prev + 10);
      } else {
        newIncorrect.add(cellKey);
        playSound(false);
        setMistakes(prev => {
          const newMistakes = prev + 1;
          if (newMistakes >= 3) setIsGameOver(true);
          return newMistakes;
        });
      }
    } else if (value === "") {
      const newGrid = [...grid];
      newGrid[row][col] = 0;
      setGrid(newGrid);
    }

    setCorrectCells(newCorrect);
    setIncorrectCells(newIncorrect);
    if (checkCompletion()) setIsCompleted(true);
  };

  const isSameRow = (row: number) => focusedCell?.row === row;
  const isSameCol = (col: number) => focusedCell?.col === col;
  const isSameSubgrid = (row: number, col: number) => {
    if (!focusedCell) return false;
    const subgridStartRow = Math.floor(focusedCell.row / 3) * 3;
    const subgridStartCol = Math.floor(focusedCell.col / 3) * 3;
    return (
      row >= subgridStartRow &&
      row < subgridStartRow + 3 &&
      col >= subgridStartCol &&
      col < subgridStartCol + 3
    );
  };

  const isSameNumberInConflict = (row: number, col: number) => {
    if (!focusedCell) return false;
    const focusedValue = grid[focusedCell.row][focusedCell.col];
    const currentValue = grid[row][col];
    
    return focusedValue === currentValue && (
      row === focusedCell.row ||
      col === focusedCell.col ||
      (Math.floor(row/3) === Math.floor(focusedCell.row/3) &&
       Math.floor(col/3) === Math.floor(focusedCell.col/3))
    );
  };

  return (
    <div className="sudoku-container">
      <div className="sudoku-stats">
        <div>Score: {score}</div>
        <div>Mistakes: {mistakes}/3</div>
        <div>Time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</div>
        <button onClick={onNewGame} className="new-game-button">
          New Game
        </button>
      </div>

      <div className="sudoku-grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;
            const isCorrect = correctCells.has(cellKey);
            const isIncorrect = incorrectCells.has(cellKey);
            const currentValue = focusedCell ? grid[focusedCell.row][focusedCell.col] : null;
            
            return (
              <SudokuCell
                key={cellKey}
                value={cell}
                row={rowIndex}
                col={colIndex}
                onChange={handleChange}
                isEditable={isEditable[rowIndex][colIndex]}
                isFocused={focusedCell?.row === rowIndex && focusedCell?.col === colIndex}
                isHighlighted={
                  isSameRow(rowIndex) ||
                  isSameCol(colIndex) ||
                  isSameSubgrid(rowIndex, colIndex)
                }
                isCorrect={isCorrect}
                isIncorrect={isIncorrect}
                isConflict={!!currentValue && isSameNumberInConflict(rowIndex, colIndex)}
                sameNumber={!!currentValue && currentValue === cell}
                onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                onBlur={() => setFocusedCell(null)}
              />
            );
          })
        )}
      </div>

      {isGameOver && <div className="game-message error">Game Over!</div>}
      {isCompleted && <div className="game-message success">Puzzle Completed!</div>}
    </div>
  );
};

export default SudokuGrid;