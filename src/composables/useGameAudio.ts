import { ref, watch, type WatchStopHandle } from 'vue'
import type { CanonicalGameManifest } from '@/types'
import { useSettingsStore } from '@/stores/settingsStore'
import { audioManager as survivorAudio } from '@/games/survivor/audio'

type ShellSfx = 'buttonClick' | 'notification' | 'achievement' | 'coinCollect' | 'levelUp' | 'gameOver'
type GameSfx = 'score' | 'hit' | 'hurt' | 'powerUp' | 'move' | 'success' | 'fail'
type SynthSfx = ShellSfx | GameSfx
type AudioChannel = 'ui' | 'game'

export const SHELL_AUDIO_TUNING = {
  musicBusGain: 0.18,
  musicLoopMs: 5200,
  sfxGainBoost: 1.25,
} as const

const sfxPresets: Record<SynthSfx, { frequency: number; duration: number; type: OscillatorType; gain: number; bend?: number }> = {
  buttonClick: { frequency: 520, duration: 0.07, type: 'square', gain: 0.035 },
  notification: { frequency: 740, duration: 0.12, type: 'sine', gain: 0.045 },
  achievement: { frequency: 880, duration: 0.2, type: 'triangle', gain: 0.05 },
  coinCollect: { frequency: 1040, duration: 0.1, type: 'triangle', gain: 0.04 },
  levelUp: { frequency: 660, duration: 0.22, type: 'sawtooth', gain: 0.04 },
  gameOver: { frequency: 180, duration: 0.32, type: 'sine', gain: 0.04 },
  score: { frequency: 980, duration: 0.06, type: 'triangle', gain: 0.028, bend: 1.18 },
  hit: { frequency: 190, duration: 0.08, type: 'square', gain: 0.032, bend: 0.62 },
  hurt: { frequency: 140, duration: 0.16, type: 'sawtooth', gain: 0.038, bend: 0.54 },
  powerUp: { frequency: 760, duration: 0.16, type: 'triangle', gain: 0.04, bend: 1.55 },
  move: { frequency: 420, duration: 0.035, type: 'sine', gain: 0.014, bend: 1.08 },
  success: { frequency: 720, duration: 0.14, type: 'triangle', gain: 0.038, bend: 1.36 },
  fail: { frequency: 220, duration: 0.12, type: 'sine', gain: 0.034, bend: 0.7 },
}

let shellAudioContext: AudioContext | null = null
let shellSfxGain: GainNode | null = null
let shellMusicGain: GainNode | null = null
let shellMusicTimer: ReturnType<typeof window.setTimeout> | null = null
let shellMusicNodes: Array<{ oscillator: OscillatorNode; gain: GainNode }> = []
let shellMusicStarted = false

function getShellAudioContext() {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextCtor) return null
  shellAudioContext ??= new AudioContextCtor()
  return shellAudioContext
}

function getShellSfxGain(context: AudioContext) {
  shellSfxGain ??= context.createGain()
  shellSfxGain.connect(context.destination)
  return shellSfxGain
}

function getShellMusicGain(context: AudioContext) {
  shellMusicGain ??= context.createGain()
  shellMusicGain.connect(context.destination)
  return shellMusicGain
}

function stopShellMusic() {
  shellMusicStarted = false
  if (shellMusicTimer) {
    clearTimeout(shellMusicTimer)
    shellMusicTimer = null
  }
  for (const node of shellMusicNodes) {
    try {
      node.oscillator.stop()
    } catch {
      // already stopped
    }
    node.gain.disconnect()
    node.oscillator.disconnect()
  }
  shellMusicNodes = []
}

function registerShellMusicNode(oscillator: OscillatorNode, gain: GainNode) {
  const node = { oscillator, gain }
  shellMusicNodes.push(node)
  oscillator.onended = () => {
    gain.disconnect()
    oscillator.disconnect()
    shellMusicNodes = shellMusicNodes.filter((current) => current !== node)
  }
}

function shellMusicSeed(gameId: string) {
  return [...gameId].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

async function startShellMusic(gameId: string, settingsStore: ReturnType<typeof useSettingsStore>) {
  if (!settingsStore.musicEnabled || shellMusicStarted) return
  const context = getShellAudioContext()
  if (!context) return
  if (context.state === 'suspended') {
    try {
      await context.resume()
    } catch {
      return
    }
  }

  shellMusicStarted = true
  const schedule = () => {
    if (!shellMusicStarted || !settingsStore.musicEnabled) {
      stopShellMusic()
      return
    }

    const musicGain = getShellMusicGain(context)
    const now = context.currentTime + 0.02
    const loopSeconds = SHELL_AUDIO_TUNING.musicLoopMs / 1000
    const seed = shellMusicSeed(gameId)
    const root = [196, 220, 247, 262][seed % 4] ?? 220
    const melody = [0, 3, 5, 7, 10, 7, 5, 3].map((step) => root * Math.pow(2, step / 12))

    musicGain.gain.setValueAtTime(settingsStore.masterVolume * settingsStore.musicVolume * SHELL_AUDIO_TUNING.musicBusGain, now)

    const bass = context.createOscillator()
    const bassGain = context.createGain()
    bass.type = 'triangle'
    bass.frequency.setValueAtTime(root / 2, now)
    bassGain.gain.setValueAtTime(0.28, now)
    bassGain.gain.linearRampToValueAtTime(0.08, now + loopSeconds)
    bass.connect(bassGain)
    bassGain.connect(musicGain)
    registerShellMusicNode(bass, bassGain)
    bass.start(now)
    bass.stop(now + loopSeconds)

    melody.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const noteStart = now + index * 0.56
      const noteEnd = noteStart + 0.42
      oscillator.type = index % 2 === 0 ? 'sine' : 'triangle'
      oscillator.frequency.setValueAtTime(frequency, noteStart)
      gain.gain.setValueAtTime(0.0001, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd)
      oscillator.connect(gain)
      gain.connect(musicGain)
      registerShellMusicNode(oscillator, gain)
      oscillator.start(noteStart)
      oscillator.stop(noteEnd + 0.02)
    })

    shellMusicTimer = window.setTimeout(schedule, SHELL_AUDIO_TUNING.musicLoopMs)
  }

  schedule()
}

export function useGameAudio(manifest: CanonicalGameManifest | undefined) {
  const settingsStore = useSettingsStore()
  const audioUnlocked = ref(false)
  let stopMusicWatch: WatchStopHandle | null = null
  let audioCleanup: (() => void) | null = null

  function initAudio() {
    if (!manifest?.capabilities.hasAudio) return

    if (manifest.gameId === 'survivor') {
      survivorAudio.init()
    }
  }

  async function unlockAudio(): Promise<boolean> {
    if (!manifest?.capabilities.hasAudio) return false
    if (audioUnlocked.value) return true

    if (manifest.gameId === 'survivor') {
      audioUnlocked.value = await survivorAudio.unlock()
      return audioUnlocked.value
    }

    const context = getShellAudioContext()
    if (!context) return false
    if (context.state === 'suspended') {
      try {
        await context.resume()
      } catch {
        return false
      }
    }
    audioUnlocked.value = true
    return true
  }

  async function startMusic(isPaused: boolean = false) {
    if (!manifest?.capabilities.hasAudio) return
    if (!audioUnlocked.value || isPaused) return
    if (!settingsStore.musicEnabled) return

    if (manifest.gameId === 'survivor') {
      await survivorAudio.startMusic()
      return
    }

    await startShellMusic(manifest.gameId, settingsStore)
  }

  function channelVolume(channel: AudioChannel) {
    const channelLevel = channel === 'ui' ? settingsStore.uiVolume : settingsStore.soundVolume
    return settingsStore.masterVolume * channelLevel
  }

  async function playSynthSfx(name: SynthSfx, channel: AudioChannel) {
    if (!settingsStore.soundEnabled) return
    if (manifest?.capabilities.hasAudio) {
      const unlocked = await unlockAudio()
      if (!unlocked) return
    }

    if (manifest?.gameId === 'survivor') {
      const survivorMap: Partial<Record<ShellSfx, () => Promise<void>>> = {
        achievement: () => survivorAudio.playLevelUp(),
        coinCollect: () => survivorAudio.playXpPickup(),
        levelUp: () => survivorAudio.playLevelUp(),
        gameOver: () => survivorAudio.playGameOver(),
      }
      const playSurvivorSfx = name in survivorMap ? survivorMap[name as ShellSfx] : undefined
      if (playSurvivorSfx) {
        const unlocked = await unlockAudio()
        if (unlocked) {
          await playSurvivorSfx()
          return
        }
      }
    }

    const context = getShellAudioContext()
    const preset = sfxPresets[name]
    if (!context || !preset) return
    if (context.state === 'suspended') {
      try {
        await context.resume()
      } catch {
        return
      }
    }

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const outputGain = getShellSfxGain(context)
    const now = context.currentTime
    outputGain.gain.setValueAtTime(channelVolume(channel), now)
    oscillator.type = preset.type
    oscillator.frequency.setValueAtTime(preset.frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(60, preset.frequency * (preset.bend ?? 0.72)), now + preset.duration)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(preset.gain * SHELL_AUDIO_TUNING.sfxGainBoost, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration)
    oscillator.connect(gain)
    gain.connect(outputGain)
    oscillator.start(now)
    oscillator.stop(now + preset.duration + 0.02)

    const overtone = context.createOscillator()
    const overtoneGain = context.createGain()
    overtone.type = preset.type === 'sine' ? 'triangle' : 'sine'
    overtone.frequency.setValueAtTime(preset.frequency * 1.5, now)
    overtone.frequency.exponentialRampToValueAtTime(Math.max(80, preset.frequency * 1.5 * (preset.bend ?? 0.9)), now + preset.duration)
    overtoneGain.gain.setValueAtTime(0.0001, now)
    overtoneGain.gain.exponentialRampToValueAtTime(preset.gain * 0.38 * SHELL_AUDIO_TUNING.sfxGainBoost, now + 0.014)
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration * 0.82)
    overtone.connect(overtoneGain)
    overtoneGain.connect(outputGain)
    overtone.start(now)
    overtone.stop(now + preset.duration + 0.02)
  }

  async function playShellSfx(name: ShellSfx) {
    await playSynthSfx(name, 'ui')
  }

  async function playGameSfx(name: GameSfx) {
    await playSynthSfx(name, 'game')
  }

  function stopMusic() {
    if (!manifest?.capabilities.hasAudio) return

    if (manifest.gameId === 'survivor') {
      survivorAudio.stopMusic()
      return
    }

    stopShellMusic()
  }

  function setupAudio(isPaused: () => boolean, isGameOver: () => boolean): () => void {
    if (!manifest?.capabilities.hasAudio) return () => {}

    initAudio()

    const handleAudioUnlock = async () => {
      const unlocked = await unlockAudio()
      if (unlocked && !isPaused() && !isGameOver() && settingsStore.musicEnabled) {
        await startMusic(isPaused())
      }
    }

    window.addEventListener('pointerdown', handleAudioUnlock)
    window.addEventListener('keydown', handleAudioUnlock)

    stopMusicWatch = watch(
      () => settingsStore.musicEnabled,
      (musicEnabled) => {
        if (!musicEnabled) {
          stopMusic()
          return
        }

        if (audioUnlocked.value && !isPaused() && !isGameOver()) {
          void startMusic(isPaused())
        }
      },
    )

    audioCleanup = () => {
      window.removeEventListener('pointerdown', handleAudioUnlock)
      window.removeEventListener('keydown', handleAudioUnlock)
      stopMusicWatch?.()
      stopMusicWatch = null
      stopMusic()

      if (manifest.gameId === 'survivor') {
        survivorAudio.dispose()
      }

      audioUnlocked.value = false
    }

    return audioCleanup
  }

  function handlePause() {
    if (!manifest?.capabilities.hasAudio) return
    stopMusic()
  }

  async function handleResume(isPaused: boolean, isGameOver: boolean) {
    if (!manifest?.capabilities.hasAudio) return
    if (isGameOver) return

    const unlocked = await unlockAudio()
    if (unlocked && !isPaused && settingsStore.musicEnabled) {
      await startMusic(isPaused)
    }
  }

  function dispose() {
    audioCleanup?.()
    audioCleanup = null
  }

  return {
    audioUnlocked,
    initAudio,
    unlockAudio,
    startMusic,
    stopMusic,
    playShellSfx,
    playGameSfx,
    setupAudio,
    handlePause,
    handleResume,
    dispose,
  }
}
