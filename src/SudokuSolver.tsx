import "./SudokuSolver.css";

export class SudokuSolver {
  solve(puzzle: number[][]): number[][] | null {
    const grid = puzzle.map((row) => [...row]);
    return this.solveRecursive(grid) ? grid : null;
  }

  private solveRecursive(grid: number[][]): boolean {
    const emptyCell = this.findEmptyCell(grid);
    if (!emptyCell) return true;

    const [row, col] = emptyCell;
    const possibilities = this.getPossibleNumbers(grid, row, col);

    for (const num of possibilities) {
      grid[row][col] = num;
      if (this.solveRecursive(grid)) return true;
      grid[row][col] = 0;
    }
    return false;
  }

  private findEmptyCell(grid: number[][]): [number, number] | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) return [row, col];
      }
    }
    return null;
  }

  private getPossibleNumbers(
    grid: number[][],
    row: number,
    col: number
  ): number[] {
    const used = new Set<number>();

    for (let i = 0; i < 9; i++) {
      used.add(grid[row][i]);
      used.add(grid[i][col]);
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        used.add(grid[boxRow + i][boxCol + j]);
      }
    }

    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !used.has(n));
  }
}
