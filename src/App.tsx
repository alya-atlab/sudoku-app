import React, { useState } from "react";
import SudokuGrid from "./sudokuGrid";
import StartScreen from "./StartScreen";
import { SudokuGenerator } from "./SudokuGenerator";

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [initialGrid, setInitialGrid] = useState<number[][]>([]);
  const [solutionGrid, setSolutionGrid] = useState<number[][]>([]);
  const [isManualMode, setIsManualMode] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const handleStartGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty);
    const generator = new SudokuGenerator(selectedDifficulty);
    setInitialGrid(generator.getPuzzle());
    setSolutionGrid(generator.getSolution());
    setGameStarted(true);
    setIsManualMode(false);
  };

  const handleManualSolve = () => {
    setInitialGrid(
      Array(9)
        .fill(0)
        .map(() => Array(9).fill(0))
    );
    setSolutionGrid([]);
    setIsManualMode(true);
    setGameStarted(true);
  };

  return (
    <div className="App">
      {gameStarted ? (
        <SudokuGrid
          initialGrid={initialGrid}
          solutionGrid={solutionGrid}
          isManualMode={isManualMode}
          difficulty={difficulty}
          onNewGame={() => {
            setGameStarted(false);
            setIsManualMode(false);
          }}
          setSolutionGrid={setSolutionGrid}
        />
      ) : (
        <StartScreen
          onStart={handleStartGame}
          onManualSolve={handleManualSolve}
        />
      )}
    </div>
  );
};

export default App;
