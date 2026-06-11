import { describe, expect, it } from 'vitest'
import {
  computeBreakoutBrickMetrics,
  createBreakoutLaunchVelocity,
  normalizeBreakoutPowerUpId,
} from './index'

describe('breakout tuning helpers', () => {
  it('creates playable brick dimensions instead of tiny capped blocks', () => {
    const metrics = computeBreakoutBrickMetrics({
      canvasWidth: 390,
      canvasHeight: 720,
      dpr: 1,
      rows: 5,
      cols: 10,
    })

    expect(metrics.width).toBeGreaterThanOrEqual(28)
    expect(metrics.height).toBeGreaterThanOrEqual(14)
    expect(metrics.gap).toBeGreaterThanOrEqual(6)
    expect(metrics.left + metrics.cols * metrics.width + (metrics.cols - 1) * metrics.gap).toBeLessThanOrEqual(390)
  })

  it('creates an upward launch velocity with stable readable speed', () => {
    const velocity = createBreakoutLaunchVelocity({ level: 1, dpr: 1, random: () => 0.5 })
    const speed = Math.hypot(velocity.vx, velocity.vy)

    expect(speed).toBeGreaterThanOrEqual(4)
    expect(speed).toBeLessThanOrEqual(5)
    expect(velocity.vy).toBeLessThan(0)
  })

  it('normalizes current data power-up ids to gameplay effect ids', () => {
    expect(normalizeBreakoutPowerUpId('wide_paddle')).toBe('wide_paddle')
    expect(normalizeBreakoutPowerUpId('sticky_paddle')).toBe('sticky_paddle')
    expect(normalizeBreakoutPowerUpId('laser')).toBe('laser')
    expect(normalizeBreakoutPowerUpId('narrow_paddle')).toBe('narrow_paddle')
    expect(normalizeBreakoutPowerUpId('slow_ball')).toBe('slow_ball')
    expect(normalizeBreakoutPowerUpId('speed_ball')).toBe('speed_ball')
    expect(normalizeBreakoutPowerUpId('extra_life')).toBe('extra_life')
  })
})
