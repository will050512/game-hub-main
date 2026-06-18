import { describe, expect, it } from 'vitest'
import { resolveGamePlatformLayout, detectSafeArea } from '@/composables/useGamePlatformLayout'

describe('resolveGamePlatformLayout', () => {
  it('keeps narrow phones in handheld fullscreen layout', () => {
    const layout = resolveGamePlatformLayout({
      width: 390,
      height: 844,
      isCoarsePointer: true,
      isNativePlatform: false,
      isStandalone: false,
      orientation: 'portrait',
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    expect(layout.mode).toBe('handheld')
    expect(layout.shellClass).toBe('game-layout-handheld')
    expect(layout.usesSideHud).toBe(false)
  })

  it('treats phone landscape as handheld so the canvas is not squeezed by a side rail', () => {
    const layout = resolveGamePlatformLayout({
      width: 780,
      height: 360,
      isCoarsePointer: true,
      isNativePlatform: false,
      isStandalone: false,
      orientation: 'landscape',
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    expect(layout.mode).toBe('handheld')
    expect(layout.usesSideHud).toBe(false)
  })

  it('uses a wide side-hud layout on roomy desktop screens', () => {
    const layout = resolveGamePlatformLayout({
      width: 1280,
      height: 800,
      isCoarsePointer: false,
      isNativePlatform: false,
      isStandalone: false,
      orientation: 'landscape',
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    expect(layout.mode).toBe('desktop')
    expect(layout.shellClass).toBe('game-layout-wide')
    expect(layout.usesSideHud).toBe(true)
  })
})

describe('detectSafeArea', () => {
  it('should return 0 for empty CSS values (NaN bug fix)', () => {
    const insets = detectSafeArea()
    expect(Number.isNaN(insets.top)).toBe(false)
    expect(Number.isNaN(insets.right)).toBe(false)
    expect(Number.isNaN(insets.bottom)).toBe(false)
    expect(Number.isNaN(insets.left)).toBe(false)
    expect(insets.top).toBe(0)
    expect(insets.right).toBe(0)
    expect(insets.bottom).toBe(0)
    expect(insets.left).toBe(0)
  })
})
