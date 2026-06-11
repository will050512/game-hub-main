import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createInvadersGame } from './index'

/**
 * Test suite for Invaders game cooldown clamping.
 * 
 * Regression test: Excessive fireRateBonus from stacked loadout bonuses
 * can drive shootCooldownMs below a safe floor, causing rapid-fire behavior
 * that breaks game balance.
 */
describe('Invaders - Player Shot Cooldown Clamping', () => {
  let game: {
    dpr: number
    player: { x: number; y: number; width: number; height: number }
    playerBullets: Array<unknown>
    rapidFireActive: boolean
    shootCooldownMs: number
    loadoutCodex: { getActiveBonuses: () => { fireRateBonus: number; moveSpeedBonus: number; shieldDurationBonus: number; powerUpDropBonus: number; scoreMultiplier: number; startingLives: number } }
    tryShootPlayerBullet: () => void
  }

  beforeEach(() => {
    game = createInvadersGame() as unknown as typeof game
    game.dpr = 1
    game.player = {
      x: 100,
      y: 200,
      width: 40,
      height: 24,
    }
    game.playerBullets = []
    game.rapidFireActive = false
    game.shootCooldownMs = 0
  })

  it('should clamp shootCooldownMs to safe minimum when fireRateBonus is excessive', () => {
    // This test demonstrates the bug: excessive fireRateBonus produces unsafe cooldown.
    // When fireRateBonus is 0.95 (from stacked bonuses), the calculation produces
    // shootCooldownMs = 180 * (1 - 0.95) = 9ms, which is unsafe.

    // Mock the loadoutCodex to return excessive fireRateBonus
    const mockBonuses = {
      fireRateBonus: 0.95,
      moveSpeedBonus: 0,
      shieldDurationBonus: 0,
      powerUpDropBonus: 0,
      scoreMultiplier: 0,
      startingLives: 0,
    }

    vi.spyOn(game.loadoutCodex, 'getActiveBonuses').mockReturnValue(mockBonuses)

    game.tryShootPlayerBullet()

    // The bug: shootCooldownMs should be clamped to a safe minimum (e.g., 10ms)
    // Without the fix, it would be ~9ms (unsafe)
    const minSafeCooldown = 10
    expect(game.shootCooldownMs).toBeGreaterThanOrEqual(minSafeCooldown)
  })

  it('should preserve normal cooldown behavior with reasonable fireRateBonus', () => {
    const mockBonuses = {
      fireRateBonus: 0.15,
      moveSpeedBonus: 0,
      shieldDurationBonus: 0,
      powerUpDropBonus: 0,
      scoreMultiplier: 0,
      startingLives: 0,
    }

    vi.spyOn(game.loadoutCodex, 'getActiveBonuses').mockReturnValue(mockBonuses)

    game.tryShootPlayerBullet()

    // With fireRateBonus = 0.15:
    // shootCooldownMs = 180 * (1 - 0.15) = 153
    // Should not be clamped (already above minimum)
    expect(game.shootCooldownMs).toBeCloseTo(153)
  })

  it('should clamp to minimum even with rapid fire active', () => {
    const mockBonuses = {
      fireRateBonus: 0.95,
      moveSpeedBonus: 0,
      shieldDurationBonus: 0,
      powerUpDropBonus: 0,
      scoreMultiplier: 0,
      startingLives: 0,
    }

    vi.spyOn(game.loadoutCodex, 'getActiveBonuses').mockReturnValue(mockBonuses)

    game.rapidFireActive = true

    game.tryShootPlayerBullet()

    // With rapid fire: baseCooldown = 90
    // fireRateMult = 1 - 0.95 = 0.05
    // shootCooldownMs = 90 * 0.05 = 4.5 (UNSAFE)
    // Should be clamped to minimum
    const minSafeCooldown = 10
    expect(game.shootCooldownMs).toBeGreaterThanOrEqual(minSafeCooldown)
  })
})
