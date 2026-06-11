import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMemoryGame } from './index'
import type { GameInstance } from '@/types'

describe('MemoryGame - mismatch timeout leak', () => {
  let game: GameInstance
  let canvas: HTMLCanvasElement
  let mockCallbacks: any

  beforeEach(() => {
    vi.useFakeTimers()
    canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 600
    
    const mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      quadraticCurveTo: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
    }
    
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as any)
    
    mockCallbacks = {
      onStatsUpdate: vi.fn(),
      onHudUpdate: vi.fn(),
      onRewardEvent: vi.fn(),
      onGameOver: vi.fn(),
    }
    game = createMemoryGame()
    game.start(canvas, mockCallbacks)
  })

  afterEach(() => {
    game.stop()
    vi.useRealTimers()
  })

  it('clears pending mismatch timeout when restarting game', () => {
    const gameInternal = game as any
    
    gameInternal.setupBoard()
    gameInternal.phase = 'playing'
    
    expect(gameInternal.phase).toBe('playing')
    expect(gameInternal.cards.length).toBeGreaterThan(0)

    const card1 = gameInternal.cards.find((c: any) => !c.matched)
    const card2 = gameInternal.cards.find((c: any) => !c.matched && c.symbol !== card1.symbol)
    
    expect(card1).toBeDefined()
    expect(card2).toBeDefined()

    card1.flipped = true
    gameInternal.flippedCards.push(card1)

    card2.flipped = true
    gameInternal.flippedCards.push(card2)
    gameInternal.moves++
    gameInternal.checkMatch()

    expect(card1.flipped).toBe(true)
    expect(card2.flipped).toBe(true)
    expect(gameInternal.lockBoard).toBe(true)
    expect(gameInternal.flippedCards.length).toBe(2)

    gameInternal.setupBoard()
    gameInternal.phase = 'playing'
    gameInternal.moves = 0
    gameInternal.matches = 0
    gameInternal.lockBoard = true
    gameInternal.flippedCards = [{ id: 999, symbol: 'NEW', flipped: true, matched: false }]

    expect(gameInternal.flippedCards.length).toBe(1)
    expect(gameInternal.flippedCards[0].id).toBe(999)
    expect(gameInternal.lockBoard).toBe(true)

    vi.advanceTimersByTime(800)

    expect(gameInternal.flippedCards.length).toBe(1)
    expect(gameInternal.flippedCards[0].id).toBe(999)
    expect(gameInternal.lockBoard).toBe(true)
  })
})
