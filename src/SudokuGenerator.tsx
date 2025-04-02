export class SudokuGenerator {
  private solution: number[][];
  private puzzle: number[][];
  private difficulty: 'easy' | 'medium' | 'hard';

  constructor(difficulty: 'easy' | 'medium' | 'hard' = 'easy') {
    this.difficulty = difficulty;
    this.solution = this.generateCompleteGrid();
    this.puzzle = this.generatePuzzle();
  }

  private generateCompleteGrid(): number[][] {
    const grid = Array(9).fill(0).map(() => Array(9).fill(0));
    this.fillGrid(grid);
    return grid;
  }

  private fillGrid(grid: number[][]): boolean {
    const emptyCell = this.findEmptyCell(grid);
    if (!emptyCell) return true;
    
    const [row, col] = emptyCell;
    const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of numbers) {
      if (this.isValidPlacement(grid, row, col, num)) {
        grid[row][col] = num;
        if (this.fillGrid(grid)) return true;
        grid[row][col] = 0;
      }
    }
    return false;
  }

  private generatePuzzle(): number[][] {
    const puzzle = this.solution.map(row => [...row]);
    const cellsToRemove = {
      easy: 30,
      medium: 40,
      hard: 50
    }[this.difficulty];

    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== 0) {
        const original = puzzle[row][col];
        puzzle[row][col] = 0;
        
        if (this.hasUniqueSolution(puzzle)) {
          removed++;
        } else {
          puzzle[row][col] = original;
        }
      }
    }
    return puzzle;
  }

  private hasUniqueSolution(grid: number[][]): boolean {
    const gridCopy = grid.map(row => [...row]);
    let solutionCount = 0;

    const countSolutions = (): boolean => {
        let minPossibilities = 10;
        let targetRow = -1;
        let targetCol = -1;
        let possibilities: number[] = [];

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (gridCopy[row][col] === 0) {
                    const currentPossibilities = this.getPossibleNumbers(gridCopy, row, col);
                    if (currentPossibilities.length < minPossibilities) {
                        minPossibilities = currentPossibilities.length;
                        targetRow = row;
                        targetCol = col;
                        possibilities = currentPossibilities;
                        if (minPossibilities === 1) break;
                    }
                }
            }
            if (minPossibilities === 1) break; 
        }
        if (targetRow === -1) {
            solutionCount++;
            return solutionCount > 1; 
        }
        for (const num of possibilities) {
            gridCopy[targetRow][targetCol] = num;
            
            if (countSolutions()) {
                return true; 
            }
            gridCopy[targetRow][targetCol] = 0;
            
            if (solutionCount > 1) {
                return true;
            }
        }
        return false;
    };
    countSolutions();
    return solutionCount === 1;
}

private getPossibleNumbers(grid: number[][], row: number, col: number): number[] {
    const usedNumbers = new Set<number>();
    
    for (let i = 0; i < 9; i++) {
        usedNumbers.add(grid[row][i]);
        usedNumbers.add(grid[i][col]);
    }
    
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            usedNumbers.add(grid[boxStartRow + i][boxStartCol + j]);
        }
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !usedNumbers.has(n));
}

  private findEmptyCell(grid: number[][]): [number, number] | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) return [row, col];
      }
    }
    return null;
  }

  private isValidPlacement(grid: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxStartRow + i][boxStartCol + j] === num) return false;
      }
    }
    return true;
  }

  private shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public getPuzzle(): number[][] {
    return this.puzzle;
  }

  public getSolution(): number[][] {
    return this.solution;
  }
}