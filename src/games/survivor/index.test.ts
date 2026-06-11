import { describe, expect, it } from 'vitest'
import { SURVIVOR_VISUAL_TUNING } from './index'

describe('survivor visual tuning', () => {
  it('uses a readable close-range world scale for the survivor playfield', () => {
    expect(SURVIVOR_VISUAL_TUNING.worldScale).toBeGreaterThanOrEqual(1.25)
    expect(SURVIVOR_VISUAL_TUNING.playerRadius).toBeGreaterThanOrEqual(16)
    expect(SURVIVOR_VISUAL_TUNING.enemyScale).toBeGreaterThanOrEqual(1.2)
    expect(SURVIVOR_VISUAL_TUNING.pickupScale).toBeGreaterThanOrEqual(1.25)
  })
})
