import { describe, it, expect } from 'vitest'
import { createTowerDefenseGame } from './index'

describe('Tower Defense - Wave Progression Bug', () => {
  it('starts the first wave at wave 1', () => {
    const game = createTowerDefenseGame() as unknown as {
      wave: number
      startWave: () => void
    }

    game.wave = 0
    game.startWave()

    expect(game.wave).toBe(1)
  })

  it('increments wave exactly once when a cleared wave advances', () => {
    const game = createTowerDefenseGame() as unknown as {
      wave: number
      gold: number
      enemiesPerWave: number
      enemiesSpawned: number
      enemies: unknown[]
      spawnInterval: number
      updateSpawning: (dt: number) => void
    }

    game.wave = 1
    game.gold = 0
    game.enemiesPerWave = 8
    game.enemiesSpawned = 8
    game.enemies = []

    game.updateSpawning(16.667)

    expect(game.wave).toBe(2)
    expect(game.enemiesSpawned).toBe(0)
    expect(game.enemiesPerWave).toBe(11)
    expect(game.spawnInterval).toBe(900)
    expect(game.gold).toBe(60)
  })
})
