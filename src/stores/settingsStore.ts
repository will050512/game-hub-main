import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'game_hub_settings'

interface Settings {
  soundEnabled: boolean
  musicEnabled: boolean
  masterVolume: number
  soundVolume: number
  musicVolume: number
  uiVolume: number
  vibrationEnabled: boolean
  touchSensitivity: number
  showFPS: boolean
}

const defaults: Settings = {
  soundEnabled: true,
  musicEnabled: true,
  masterVolume: 0.95,
  soundVolume: 0.95,
  musicVolume: 0.75,
  uiVolume: 0.75,
  vibrationEnabled: true,
  touchSensitivity: 1.0,
  showFPS: false,
}

const previousQuietDefaultVolumes = {
  masterVolume: 0.85,
  soundVolume: 0.75,
  musicVolume: 0.45,
  uiVolume: 0.65,
} as const

function clampNormalizedVolume(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
}

function migrateQuietDefaultVolume<K extends keyof typeof previousQuietDefaultVolumes>(
  parsed: Partial<Settings>,
  key: K,
): number {
  return parsed[key] === previousQuietDefaultVolumes[key] ? defaults[key] : clampNormalizedVolume(parsed[key] as number)
}

function loadFromStorage(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    const parsed = { ...defaults, ...JSON.parse(raw) }
    return {
      ...parsed,
      masterVolume: migrateQuietDefaultVolume(parsed, 'masterVolume'),
      soundVolume: migrateQuietDefaultVolume(parsed, 'soundVolume'),
      musicVolume: migrateQuietDefaultVolume(parsed, 'musicVolume'),
      uiVolume: migrateQuietDefaultVolume(parsed, 'uiVolume'),
    }
  } catch {
    return { ...defaults }
  }
}

function saveToStorage(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export const useSettingsStore = defineStore('settings', () => {
  const stored = loadFromStorage()

  const soundEnabled = ref(stored.soundEnabled)
  const musicEnabled = ref(stored.musicEnabled)
  const masterVolume = ref(stored.masterVolume)
  const soundVolume = ref(stored.soundVolume)
  const musicVolume = ref(stored.musicVolume)
  const uiVolume = ref(stored.uiVolume)
  const vibrationEnabled = ref(stored.vibrationEnabled)
  const touchSensitivity = ref(stored.touchSensitivity)
  const showFPS = ref(stored.showFPS)

  function persist() {
    saveToStorage({
      soundEnabled: soundEnabled.value,
      musicEnabled: musicEnabled.value,
      masterVolume: masterVolume.value,
      soundVolume: soundVolume.value,
      musicVolume: musicVolume.value,
      uiVolume: uiVolume.value,
      vibrationEnabled: vibrationEnabled.value,
      touchSensitivity: touchSensitivity.value,
      showFPS: showFPS.value,
    })
  }

  watch(
    [soundEnabled, musicEnabled, masterVolume, soundVolume, musicVolume, uiVolume, vibrationEnabled, touchSensitivity, showFPS],
    persist,
  )

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
  }

  function toggleMusic() {
    musicEnabled.value = !musicEnabled.value
  }

  function setMasterVolume(value: number) {
    masterVolume.value = clampNormalizedVolume(value)
  }

  function setSoundVolume(value: number) {
    soundVolume.value = clampNormalizedVolume(value)
  }

  function setMusicVolume(value: number) {
    musicVolume.value = clampNormalizedVolume(value)
  }

  function setUiVolume(value: number) {
    uiVolume.value = clampNormalizedVolume(value)
  }

  function toggleVibration() {
    vibrationEnabled.value = !vibrationEnabled.value
  }

  function toggleFPS() {
    showFPS.value = !showFPS.value
  }

  function setSensitivity(value: number) {
    touchSensitivity.value = Math.max(0.1, Math.min(3.0, value))
  }

  return {
    soundEnabled,
    musicEnabled,
    masterVolume,
    soundVolume,
    musicVolume,
    uiVolume,
    vibrationEnabled,
    touchSensitivity,
    showFPS,
    toggleSound,
    toggleMusic,
    setMasterVolume,
    setSoundVolume,
    setMusicVolume,
    setUiVolume,
    toggleVibration,
    toggleFPS,
    setSensitivity,
  }
})
