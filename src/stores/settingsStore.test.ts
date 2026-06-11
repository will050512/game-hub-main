import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('loads default mixer volumes', () => {
    const store = useSettingsStore()

    expect(store.masterVolume).toBe(0.95)
    expect(store.soundVolume).toBe(0.95)
    expect(store.musicVolume).toBe(0.75)
    expect(store.uiVolume).toBe(0.75)
  })

  it('clamps mixer volumes to a normalized range', () => {
    const store = useSettingsStore()

    store.setMasterVolume(1.8)
    store.setSoundVolume(2)
    store.setMusicVolume(-1)
    store.setUiVolume(Number.NaN)

    expect(store.masterVolume).toBe(1)
    expect(store.soundVolume).toBe(1)
    expect(store.musicVolume).toBe(0)
    expect(store.uiVolume).toBe(0)
  })

  it('migrates the previous quiet default mix to the louder baseline', () => {
    localStorage.setItem('game_hub_settings', JSON.stringify({
      soundEnabled: true,
      musicEnabled: true,
      masterVolume: 0.85,
      soundVolume: 0.75,
      musicVolume: 0.45,
      uiVolume: 0.65,
      vibrationEnabled: true,
      touchSensitivity: 1,
      showFPS: false,
    }))
    setActivePinia(createPinia())

    const store = useSettingsStore()

    expect(store.masterVolume).toBe(0.95)
    expect(store.soundVolume).toBe(0.95)
    expect(store.musicVolume).toBe(0.75)
    expect(store.uiVolume).toBe(0.75)
  })

  it('keeps saved custom mixer volumes during the louder baseline migration', () => {
    localStorage.setItem('game_hub_settings', JSON.stringify({
      masterVolume: 0.6,
      soundVolume: 0.5,
      musicVolume: 0.4,
      uiVolume: 0.3,
    }))
    setActivePinia(createPinia())

    const store = useSettingsStore()

    expect(store.masterVolume).toBe(0.6)
    expect(store.soundVolume).toBe(0.5)
    expect(store.musicVolume).toBe(0.4)
    expect(store.uiVolume).toBe(0.3)
  })

  it('persists volume changes with the rest of the settings payload', async () => {
    const store = useSettingsStore()

    store.setMasterVolume(0.88)
    store.setSoundVolume(0.33)
    store.setMusicVolume(0.66)
    store.setUiVolume(0.44)
    await Promise.resolve()

    const saved = JSON.parse(localStorage.getItem('game_hub_settings') ?? '{}')
    expect(saved.masterVolume).toBe(0.88)
    expect(saved.soundVolume).toBe(0.33)
    expect(saved.musicVolume).toBe(0.66)
    expect(saved.uiVolume).toBe(0.44)
  })
})
