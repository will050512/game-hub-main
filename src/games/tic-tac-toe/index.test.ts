import { describe, it, expect, beforeEach } from 'vitest'
import { createTicTacToeGame } from './index'

describe('TicTacToe Power Cards', () => {
  let game: {
    phase: 'menu' | 'playing' | 'gameover'
    board: (('X' | 'O' | null)[])[]
    currentPlayer: 'X' | 'O'
    selectedPowerCard: 'swap' | 'block' | 'undo' | null
    blockedCells: Set<string>
    moveHistory: Array<{ r: number; c: number; player: 'X' | 'O' }>
    cellSize: number
    dpr: number
    boardOffsetX: number
    boardOffsetY: number
    powerCards: Array<{ type: 'swap' | 'block' | 'undo'; uses: number }>
    handleBoardTap: (x: number, y: number) => void
    getBestMove: () => { r: number; c: number } | null
  }

  beforeEach(() => {
    game = createTicTacToeGame() as unknown as typeof game
    game.cellSize = 100
    game.dpr = 1
    game.boardOffsetX = 0
    game.boardOffsetY = 0
    game.powerCards = [
      { type: 'swap', uses: 1 },
      { type: 'block', uses: 2 },
      { type: 'undo', uses: 1 },
    ]
  })

  describe('Swap Power Card', () => {
    it('converts O to X when swap card is selected and O cell is tapped', () => {
      game.phase = 'playing'
      game.board = [
        ['X', 'O', null],
        [null, null, null],
        [null, null, null],
      ]
      game.currentPlayer = 'X'
      game.selectedPowerCard = 'swap'
      const cellSize = game.cellSize
      const gap = Math.floor(4 * game.dpr)
      const ox = game.boardOffsetX
      const oy = game.boardOffsetY
      const tapX = ox + 1 * (cellSize + gap) + cellSize / 2
      const tapY = oy + 0 * (cellSize + gap) + cellSize / 2

      game.handleBoardTap(tapX, tapY)

      expect(game.board[0]![1]).toBe('X')
      expect(game.powerCards[0]!.uses).toBe(0)
      expect(game.selectedPowerCard).toBeNull()
    })
  })

  describe('Block Power Card', () => {
    it('blocks a cell when block card is selected and empty cell is tapped', () => {
      game.phase = 'playing'
      game.board = [
        ['X', null, null],
        [null, null, null],
        [null, null, null],
      ]
      game.currentPlayer = 'X'
      game.selectedPowerCard = 'block'
      const cellSize = game.cellSize
      const gap = Math.floor(4 * game.dpr)
      const ox = game.boardOffsetX
      const oy = game.boardOffsetY
      const tapX = ox + 1 * (cellSize + gap) + cellSize / 2
      const tapY = oy + 0 * (cellSize + gap) + cellSize / 2

      game.handleBoardTap(tapX, tapY)

      expect(game.blockedCells.has('0,1')).toBe(true)
      expect(game.powerCards[1]!.uses).toBe(1)
      expect(game.selectedPowerCard).toBeNull()
    })

    it('prevents AI from placing in blocked cells', () => {
      game.phase = 'playing'
      game.board = [
        ['O', 'O', null],
        ['X', 'X', null],
        [null, null, null],
      ]
      game.blockedCells.add('0,2')
      game.currentPlayer = 'O'

      const move = game.getBestMove()

      expect(move).not.toBeNull()
      const key = `${move!.r},${move!.c}`
      expect(key).not.toBe('0,2')
      expect(game.blockedCells.has(key)).toBe(false)
    })
  })

  describe('Undo Power Card', () => {
    it('reverts the last move when undo card is used', () => {
      game.phase = 'playing'
      game.board = [
        ['X', 'O', null],
        [null, null, null],
        [null, null, null],
      ]
      game.moveHistory = [
        { r: 0, c: 0, player: 'X' },
        { r: 0, c: 1, player: 'O' },
      ]
      game.currentPlayer = 'X'
      game.selectedPowerCard = 'undo'
      game.handleBoardTap(50, 50)

      expect(game.board[0]![1]).toBeNull()
      expect(game.moveHistory.length).toBe(1)
      expect(game.powerCards[2]!.uses).toBe(0)
      expect(game.selectedPowerCard).toBeNull()
    })
  })

  describe('Normal Play Guard', () => {
    it('places X normally when no power card is selected', () => {
      game.phase = 'playing'
      game.board = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]
      game.currentPlayer = 'X'
      game.selectedPowerCard = null
      game.moveHistory = []

      const cellSize = game.cellSize
      const gap = Math.floor(4 * game.dpr)
      const ox = game.boardOffsetX
      const oy = game.boardOffsetY
      const tapX = ox + 0 * (cellSize + gap) + cellSize / 2
      const tapY = oy + 0 * (cellSize + gap) + cellSize / 2

      game.handleBoardTap(tapX, tapY)

      expect(game.board[0]![0]).toBe('X')
      expect(game.moveHistory.length).toBe(1)
      expect(game.moveHistory[0]!).toEqual({ r: 0, c: 0, player: 'X' })
    })
  })
})
