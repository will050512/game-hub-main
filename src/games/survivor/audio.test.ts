import { describe, expect, it } from 'vitest'
import { SURVIVOR_AUDIO_TUNING } from './audio'

describe('survivor audio tuning', () => {
  it('raises generated music and sample output above the previous quiet mix', () => {
    expect(SURVIVOR_AUDIO_TUNING.musicBusGain).toBeGreaterThanOrEqual(0.18)
    expect(SURVIVOR_AUDIO_TUNING.sampleGainMultiplier).toBeGreaterThanOrEqual(1.25)
    expect(SURVIVOR_AUDIO_TUNING.synthGainMultiplier).toBeGreaterThanOrEqual(1.25)
  })
})
