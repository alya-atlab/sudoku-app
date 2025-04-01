import React from 'react';

interface SudokuCellProps {
  value: number;
  row: number;
  col: number;
  onChange: (row: number, col: number, value: string) => void;
  isEditable: boolean;
  isFocused: boolean;
  isHighlighted: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  isConflict: boolean;
  sameNumber: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  row,
  col,
  onChange,
  isEditable,
  isFocused,
  isHighlighted,
  isCorrect,
  isIncorrect,
  isConflict,
  sameNumber,
  onFocus,
  onBlur,
}) => {
  return (
    <input
      type="text"
      value={value || ''}
      placeholder=" "
      title={`Cell ${row + 1}, ${col + 1}`}
      onChange={(e) => onChange(row, col, e.target.value.replace(/[^1-9]/g, ''))}
      className={`
        sudoku-cell
        ${!isEditable ? 'prefilled' : ''}
        ${isFocused ? 'focused' : ''}
        ${isHighlighted ? 'highlighted' : ''}
        ${isCorrect ? 'correct' : ''}
        ${isIncorrect ? 'incorrect' : ''}
        ${isConflict ? 'conflict' : ''}
        ${sameNumber ? 'same-number' : ''}
      `}
      onFocus={onFocus}
      onBlur={onBlur}
      readOnly={!isEditable}
      maxLength={1}
    />
  );
};

export default SudokuCell;