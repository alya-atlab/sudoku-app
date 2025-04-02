import React, { useState } from 'react';
import SudokuGrid from './sudokuGrid';
import StartScreen from './StartScreen';
import { SudokuGenerator } from './SudokuGenerator';

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [initialGrid, setInitialGrid] = useState<number[][]>([]);
  const [solutionGrid, setSolutionGrid] = useState<number[][]>([]);

  const handleStartGame = (difficulty: 'easy' | 'medium' | 'hard') => {
    const generator = new SudokuGenerator(difficulty);
    setInitialGrid(generator.getPuzzle());
    setSolutionGrid(generator.getSolution());
    setGameStarted(true);
  };

  return (
    <div className="App">
      {gameStarted ? (
        <SudokuGrid 
          initialGrid={initialGrid} 
          solutionGrid={solutionGrid} 
          onNewGame={() => setGameStarted(false)}
        />
      ) : (
        <StartScreen onStart={handleStartGame} />
      )}
    </div>
  );
};

export default App;