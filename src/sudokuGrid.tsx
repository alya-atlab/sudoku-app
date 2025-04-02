import React, { useState, useEffect } from "react";
import SudokuCell from "./SudokuCell";
import { SudokuSolver } from "./SudokuSolver";
import "./SudokuGrid.css";

interface SudokuGridProps {
  initialGrid: number[][];
  solutionGrid: number[][];
  isManualMode: boolean;
  onNewGame: () => void;
  setSolutionGrid: (grid: number[][]) => void;
  difficulty?: "easy" | "medium" | "hard";
}

const SudokuGrid: React.FC<SudokuGridProps> = ({
  initialGrid,
  solutionGrid,
  isManualMode,
  difficulty,
  onNewGame,
  setSolutionGrid,
}) => {
  const [grid, setGrid] = useState<number[][]>(() =>
    initialGrid.map((row) => [...row])
  );
  const [focusedCell, setFocusedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [correctCells, setCorrectCells] = useState<Set<string>>(new Set());
  const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());
  const [hintedCells, setHintedCells] = useState<Set<string>>(new Set());
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [solvedCells, setSolvedCells] = useState<Set<string>>(new Set());
  const [isSolving, setIsSolving] = useState(false);
  const [solveError, setSolveError] = useState("");
  const [isEditable] = useState<boolean[][]>(() =>
    isManualMode
      ? Array(9)
          .fill(0)
          .map(() => Array(9).fill(true))
      : initialGrid.map((row) => row.map((cell) => cell === 0))
  );

  const solver = new SudokuSolver();

  useEffect(() => {
    setGrid(initialGrid.map((row) => [...row]));
    setIsGameOver(false);
    setIsCompleted(false);
    setScore(0);
    setTime(0);
    setMistakes(0);
    setCorrectCells(new Set());
    setIncorrectCells(new Set());
    setHintedCells(new Set());
    setHintsRemaining(3);
    setSolveError("");
  }, [initialGrid]);

  useEffect(() => {
    if (isGameOver || isCompleted) return;
    const interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isCompleted]);

  const playSound = (correct: boolean) => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
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
    if (isManualMode) return true;
    return value === solutionGrid[row][col];
  };

  const checkCompletion = () => {
    if (isManualMode) return false;
    return grid.every((row, i) =>
      row.every((cell, j) => cell === solutionGrid[i][j])
    );
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

      if (!isManualMode) {
        if (isValidMove(row, col, numValue)) {
          newCorrect.add(cellKey);
          playSound(true);
          setScore((prev) => prev + 10);
        } else {
          newIncorrect.add(cellKey);
          playSound(false);
          setMistakes((prev) => {
            const newMistakes = prev + 1;
            if (newMistakes >= 3) setIsGameOver(true);
            return newMistakes;
          });
        }
      }
    } else if (value === "") {
      const newGrid = [...grid];
      newGrid[row][col] = 0;
      setGrid(newGrid);
    }

    setCorrectCells(newCorrect);
    setIncorrectCells(newIncorrect);
    if (!isManualMode && checkCompletion()) setIsCompleted(true);
  };

  const handleSolve = async () => {
    setIsSolving(true);
    setSolveError("");
    try {
      const solution = solver.solve(grid);
      if (solution) {
        const newSolved = new Set<string>();
        grid.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (cell === 0 && solution[rowIndex][colIndex] !== 0) {
              newSolved.add(`${rowIndex}-${colIndex}`);
            }
          });
        });

        setSolvedCells(newSolved);
        setSolutionGrid(solution);
        setGrid(solution);
        setCorrectCells(new Set());
        setIncorrectCells(new Set());
      } else {
        setSolveError("No solution found");
      }
    } catch (error) {
      setSolveError("Invalid puzzle");
    }
    setIsSolving(false);
  };

  const handleHint = () => {
    try {
      let solution = solutionGrid;
      if (solution.length === 0) {
        const newSolution = solver.solve(grid);
        if (!newSolution) {
          setSolveError("No solution exists");
          return;
        }
        solution = newSolution;
        setSolutionGrid(newSolution);
      }

      const emptyCells: [number, number][] = [];
      grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell === 0 && !hintedCells.has(`${rowIndex}-${colIndex}`)) {
            emptyCells.push([rowIndex, colIndex]);
          }
        });
      });

      if (emptyCells.length === 0) {
        setSolveError("Puzzle already complete");
        return;
      }

      const [row, col] =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      setGrid((prev) => {
        const newGrid = prev.map((r) => [...r]);
        newGrid[row][col] = solution[row][col];
        return newGrid;
      });
      setHintedCells((prev) => new Set([...prev, `${row}-${col}`]));
      if (!isManualMode) {
        setHintsRemaining((prev) => prev - 1);
      }
    } catch (error) {
      setSolveError("Hint failed - invalid puzzle?");
    }
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

    return (
      focusedValue !== 0 &&
      focusedValue === currentValue &&
      (row === focusedCell.row ||
        col === focusedCell.col ||
        (Math.floor(row / 3) === Math.floor(focusedCell.row / 3) &&
          Math.floor(col / 3) === Math.floor(focusedCell.col / 3)))
    );
  };

  return (
    <div className="sudoku-container">
      <div className="sudoku-stats">
        {!isManualMode && (
          <>
            <div>Score: {score}</div>
            <div>Mistakes: {mistakes}/3</div>
            <div>
              Time: {Math.floor(time / 60)}:
              {(time % 60).toString().padStart(2, "0")}
            </div>
            <div>
              Difficulty:{" "}
              {difficulty!.charAt(0).toUpperCase() + difficulty!.slice(1)}
            </div>
            <div>Hints Left: {hintsRemaining}</div>
            <button
              onClick={handleHint}
              disabled={hintsRemaining <= 0 || isSolving}
              className="hint-button"
            >
              Hint ({hintsRemaining})
            </button>
          </>
        )}

        {isManualMode && (
          <div className="solver-controls">
            <button onClick={handleSolve} disabled={isSolving}>
              {isSolving ? "Solving..." : "Solve"}
            </button>
            <button
              onClick={handleHint}
              disabled={hintsRemaining <= 0 || isSolving}
              className="hint-button"
            >
              Hint
            </button>
          </div>
        )}

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
            const isHinted = hintedCells.has(cellKey);
            const currentValue = focusedCell
              ? grid[focusedCell.row][focusedCell.col]
              : null;

            return (
              <SudokuCell
                key={cellKey}
                value={cell}
                row={rowIndex}
                col={colIndex}
                onChange={handleChange}
                isEditable={isEditable[rowIndex][colIndex]}
                isFocused={
                  focusedCell?.row === rowIndex && focusedCell?.col === colIndex
                }
                isHighlighted={
                  isSameRow(rowIndex) ||
                  isSameCol(colIndex) ||
                  isSameSubgrid(rowIndex, colIndex)
                }
                isCorrect={isCorrect}
                isIncorrect={isIncorrect}
                isHinted={isHinted}
                isSolved={solvedCells.has(cellKey)}
                isConflict={
                  !!currentValue && isSameNumberInConflict(rowIndex, colIndex)
                }
                sameNumber={!!currentValue && currentValue === cell}
                onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                onBlur={() => setFocusedCell(null)}
              />
            );
          })
        )}
      </div>

      {isGameOver && <div className="game-message error">Game Over!</div>}
      {isCompleted && (
        <div className="game-message success">Puzzle Completed!</div>
      )}
      {solveError && <div className="game-message warning">{solveError}</div>}
    </div>
  );
};

export default SudokuGrid;
