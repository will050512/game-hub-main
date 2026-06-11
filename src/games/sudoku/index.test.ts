import { describe, it, expect } from 'vitest'

import { createSudokuGame } from './index'

describe('SudokuGame - Daily Challenge Puzzle Selection', () => {
  it('should load puzzle at dailyChallenge.puzzleIndex when dailyChallenge exists', () => {
    const game = createSudokuGame() as unknown as {
      difficulty: 'easy' | 'medium' | 'hard' | 'expert'
      dailyChallenge: { date: string; difficulty: 'easy' | 'medium' | 'hard' | 'expert'; puzzleIndex: number; completed: boolean; bestScore: number } | null
      loadPuzzle: () => void
      board: number[][]
    }

    game.difficulty = 'medium'
    game.dailyChallenge = {
      date: '2026-04-30',
      difficulty: 'medium',
      puzzleIndex: 1,
      completed: false,
      bestScore: 0,
    }

    game.loadPuzzle()

    const expectedPuzzle = '200080300060002008008460002070502006900000004600301090700018600100700040002090001'
    const expectedBoard: number[][] = []
    for (let r = 0; r < 9; r++) {
      const row: number[] = []
      for (let c = 0; c < 9; c++) {
        const idx = r * 9 + c
        const pVal = expectedPuzzle[idx] ?? '0'
        row.push(parseInt(pVal, 10))
      }
      expectedBoard.push(row)
    }

    expect(game.board).toEqual(expectedBoard)
  })
})
