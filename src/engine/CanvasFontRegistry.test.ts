import { describe, it, expect } from 'vitest'
import { FONTS } from './CanvasFontRegistry'

describe('CanvasFontRegistry', () => {
  it('should have all font specs defined', () => {
    expect(FONTS.title).toBeDefined()
    expect(FONTS.hud).toBeDefined()
    expect(FONTS.score).toBeDefined()
    expect(FONTS.label).toBeDefined()
    expect(FONTS.button).toBeDefined()
  })

  it('should have correct font weights', () => {
    expect(FONTS.title?.weight).toBe('bold')
    expect(FONTS.score?.weight).toBe('900')
    expect(FONTS.label?.weight).toBe('normal')
  })

  it('should have correct font sizes', () => {
    expect(FONTS.title?.size).toBe(32)
    expect(FONTS.hud?.size).toBe(16)
    expect(FONTS.score?.size).toBe(36)
    expect(FONTS.label?.size).toBe(14)
  })

  it('should have correct font names', () => {
    expect(FONTS.title?.name).toContain('Noto Sans TC')
    expect(FONTS.score?.name).toContain('Noto Sans TC')
  })
})
