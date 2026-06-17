type Board = (number | 0)[][]

export class SudokuGenerator {
  static generateSolution(): number[][] {
    const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0))
    this.fillBoard(board)
    return board
  }

  private static fillBoard(board: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row]![col] === 0) {
          const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
          for (const num of nums) {
            if (this.isValid(board, row, col, num)) {
              board[row]![col] = num
              if (this.fillBoard(board)) return true
              board[row]![col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  private static isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let x = 0; x < 9; x++) {
      if (board[row]![x] === num) return false
      if (board[x]![col] === num) return false
    }
    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i]![startCol + j] === num) return false
      }
    }
    return true
  }

  private static shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j]!, array[i]!]
    }
    return array
  }

  static generatePuzzle(
    solution: number[][],
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  ): { puzzle: number[][]; solution: number[][] } {
    const puzzle = solution.map((row) => [...row])
    const holes = { easy: 30, medium: 36, hard: 42, expert: 48 }[difficulty]

    let removed = 0
    while (removed < holes) {
      const row = Math.floor(Math.random() * 9)
      const col = Math.floor(Math.random() * 9)
      if (puzzle[row]![col] !== 0) {
        puzzle[row]![col] = 0
        removed++
      }
    }

    return { puzzle, solution }
  }
}
