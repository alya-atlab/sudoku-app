import React, { useState } from "react";
import SudokuCell from "./SudokuCell";
import "./SudokuGrid.css";

const SudokuGrid: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(
    Array(9).fill(null).map(() => Array(9).fill(0))
  );
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);

  
  const handleChange = (row: number, col: number, value: string) => {
    if (/^[1-9]?$/.test(value)) {  
      const newGrid = grid.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? Number(value) : c))
      );
      setGrid(newGrid);
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
              onChange={handleChange}  // Now properly defined
              isFocused={focusedCell?.row === rowIndex && focusedCell?.col === colIndex}
              isHighlighted={
                isSameRow(rowIndex) ||
                isSameCol(colIndex) ||
                isSameSubgrid(rowIndex, colIndex)
              }
              onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
              onBlur={() => setFocusedCell(null)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SudokuGrid;