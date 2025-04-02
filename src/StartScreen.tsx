import React from 'react';
import './StartScreen.css';

type StartScreenProps = {
  onStart: (difficulty: 'easy' | 'medium' | 'hard') => void;
};

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="start-container">
      <h1>Sudoku</h1>
      <div className="difficulty-buttons">
        <button onClick={() => onStart('easy')}>Easy</button>
        <button onClick={() => onStart('medium')}>Medium</button>
        <button onClick={() => onStart('hard')}>Hard</button>
      </div>
    </div>
  );
};

export default StartScreen;