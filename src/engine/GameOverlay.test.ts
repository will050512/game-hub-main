import { describe, it, expect, vi } from 'vitest'
import { GameOverlay } from './GameOverlay'

describe('GameOverlay', () => {
  it('should render gameover without throwing', () => {
    const overlay = new GameOverlay()
    overlay.setSize(800, 600)
    // Just verify the method exists and doesn't throw with null ctx
    overlay.render(null as unknown as CanvasRenderingContext2D, {
      state: 'gameover', score: 100, highScore: 200, level: 5,
      lives: 0, maxLives: 3, gameTime: 120, kills: 10, coins: 50,
      gameName: 'Breakout', gameColor: '#eab308', introProgress: 0, dpr: 1,
    })
  })

  it('should render menu without throwing', () => {
    const overlay = new GameOverlay()
    overlay.setSize(800, 600)
    overlay.render(null as unknown as CanvasRenderingContext2D, {
      state: 'menu', score: 0, level: 1,
      lives: 3, maxLives: 3, gameTime: 0,
      gameName: 'Breakout', gameColor: '#eab308', introProgress: 0, dpr: 1,
    })
  })

  it('should render intro without throwing', () => {
    const overlay = new GameOverlay()
    overlay.setSize(800, 600)
    overlay.render(null as unknown as CanvasRenderingContext2D, {
      state: 'intro', score: 0, level: 1,
      lives: 3, maxLives: 3, gameTime: 0,
      gameName: 'Breakout', gameColor: '#eab308', introProgress: 0.5, dpr: 1,
    })
  })

  it('should have correct initial state', () => {
    const overlay = new GameOverlay()
    expect(overlay).toBeDefined()
  })
})
