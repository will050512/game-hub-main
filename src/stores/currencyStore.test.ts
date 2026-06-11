import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCurrencyStore } from '@/stores/currencyStore'

vi.mock('@/composables/useDatabase', () => ({
  useDatabase: () => ({
    getBalance: vi.fn().mockResolvedValue(100),
    updateBalance: vi.fn(),
  }),
}))

vi.mock('@/composables/useMetaProgression', () => ({
  useMetaProgression: () => ({
    resolveReward: vi.fn(),
  }),
}))

vi.mock('./playerStore', () => ({
  usePlayerStore: () => ({
    getEffectiveStats: vi.fn().mockReturnValue({ economyBonus: 1.0 }),
    addXP: vi.fn(),
    getLevel: vi.fn().mockReturnValue(1),
  }),
}))

describe('currencyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('calculateCoins', () => {
    it('calculates coins with base multiplier', () => {
      const store = useCurrencyStore()
      const coins = store.calculateCoins('breakout', 100)
      expect(coins).toBe(100)
    })

    it('applies game-specific multipliers', () => {
      const store = useCurrencyStore()
      const tetrisCoins = store.calculateCoins('tetris', 100)
      expect(tetrisCoins).toBe(80)
      
      const snakeCoins = store.calculateCoins('snake', 100)
      expect(snakeCoins).toBe(120)
    })

    it('uses default multiplier for unknown games', () => {
      const store = useCurrencyStore()
      const coins = store.calculateCoins('unknown-game', 100)
      expect(coins).toBe(100)
    })
  })
})
