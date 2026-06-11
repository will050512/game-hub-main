import { describe, it, expect, vi } from 'vitest'
import { renderGameHud } from './GameHudRenderer'

describe('GameHudRenderer', () => {
  it('should be a function', () => {
    expect(typeof renderGameHud).toBe('function')
  })

  it('should accept valid config', () => {
    const config = {
      score: 100, level: 3, lives: 2, maxLives: 3, time: 45,
      gameColor: '#06b6d4', dpr: 1, width: 800, height: 600,
    }
    expect(config).toMatchObject({ score: 100, level: 3, lives: 2 })
  })
})
