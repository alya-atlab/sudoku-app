import React, { useState } from "react";
import SudokuCell from "./SudokuCell";
import "./SudokuGrid.css"; 

const SudokuGrid: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(
    Array(9).fill(null).map(() => Array(9).fill(0))
  );

  const handleChange = (row: number, col: number, value: string) => {
    if (/^[1-9]?$/.test(value)) {
      const newGrid = grid.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? Number(value) : c))
      );
      setGrid(newGrid);
    }
  };

  return (
    <div className="sudoku-container">
      <div className="sudoku-grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <SudokuCell
              key={`cell-${rowIndex}-${colIndex}`}
              value={cell}
              row={rowIndex}
              col={colIndex}
              onChange={handleChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SudokuGrid;
