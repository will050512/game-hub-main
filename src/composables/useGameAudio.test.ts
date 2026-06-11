import { describe, expect, it } from 'vitest'
import { SHELL_AUDIO_TUNING } from './useGameAudio'

describe('useGameAudio tuning', () => {
  it('defines layered shell music and brighter event sounds for non-survivor games', () => {
    expect(SHELL_AUDIO_TUNING.musicBusGain).toBeGreaterThanOrEqual(0.16)
    expect(SHELL_AUDIO_TUNING.musicLoopMs).toBeLessThanOrEqual(6000)
    expect(SHELL_AUDIO_TUNING.sfxGainBoost).toBeGreaterThanOrEqual(1.2)
  })
})
