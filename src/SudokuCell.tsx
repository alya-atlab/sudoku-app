import React from "react";

interface SudokuCellProps {
  value: number;
  row: number;
  col: number;
  onChange: (row: number, col: number, value: string) => void;
  isFocused: boolean;
  isHighlighted: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  row,
  col,
  onChange,
  isFocused,
  isHighlighted,
  onFocus,
  onBlur,
}) => {
  return (
    <input
      type="text"
      value={value || ""}
      placeholder=" "
      title={`Cell ${row + 1}, ${col + 1}`}
      onChange={(e) => onChange(row, col, e.target.value)}
      className={`sudoku-cell ${isFocused ? "focused" : ""} ${isHighlighted ? "highlighted" : ""}`}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};


export default SudokuCell;