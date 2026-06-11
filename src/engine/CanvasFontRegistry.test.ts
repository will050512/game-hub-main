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
    expect(FONTS.title?.size).toBe(28)
    expect(FONTS.hud?.size).toBe(12)
    expect(FONTS.score?.size).toBe(32)
    expect(FONTS.label?.size).toBe(10)
  })

  it('should have correct font names', () => {
    expect(FONTS.title?.name).toContain('Noto Sans KR')
    expect(FONTS.score?.name).toContain('Noto Sans KR')
  })
})
