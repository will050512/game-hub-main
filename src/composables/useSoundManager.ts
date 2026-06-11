import { ref, watch, onScopeDispose, type Ref } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { SoundManager, type SoundChannel } from '@/engine/audio/SoundManager'
import type { SoundEvent, GameId } from '@/engine/audio/SoundPresets'
import {
  soundEventMap,
  getRandomPath,
  buildPreloadMap,
  buildFullPreloadMap,
} from '@/engine/audio/SoundPresets'

let sharedManager: SoundManager | null = null
let sharedContext: AudioContext | null = null

function getSharedAudioContext(): AudioContext {
  if (!sharedContext) {
    const Ctor = window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext
    if (!Ctor) {
      throw new Error('Web Audio API not supported')
    }
    sharedContext = new (Ctor as typeof AudioContext)()
  }
  return sharedContext
}

function getSharedManager(): SoundManager {
  if (!sharedManager) {
    const ctx = getSharedAudioContext()
    sharedManager = new SoundManager(ctx)
  }
  return sharedManager
}

// ─── Legacy SFX name → SoundEvent mapping ──────────────────

const gameSfxToEvent: Record<string, SoundEvent> = {
  score: 'score',
  hit: 'hit',
  hurt: 'hit',
  powerUp: 'powerUp',
  move: 'place',
  success: 'success',
  fail: 'error',
}

const shellSfxToEvent: Record<string, SoundEvent> = {
  buttonClick: 'click',
  notification: 'select',
  achievement: 'success',
  coinCollect: 'collect',
  levelUp: 'levelUp',
  gameOver: 'gameOver',
}

// ─── Return type ────────────────────────────────────────────

export interface UseSoundManagerReturn {
  manager: SoundManager
  audioUnlocked: ReturnType<typeof ref<boolean>>
  loadingProgress: Ref<number>
  isActive: ReturnType<typeof ref<boolean>>
  unlock: () => Promise<boolean>
  playEvent: (event: SoundEvent, channel?: SoundChannel) => Promise<AudioBufferSourceNode | null>
  preloadGame: (gameId: GameId) => Promise<void>
  preloadAll: () => Promise<void>
  setVolume: (channel: SoundChannel, value: number) => void
  pause: () => void
  resume: () => void
  stopAll: () => void
  /** Play game SFX by legacy name (used by GamePlayView) */
  playGameSfx: (name: string) => Promise<AudioBufferSourceNode | null>
  /** Play shell/UI SFX by legacy name (used by GamePlayView) */
  playShellSfx: (name: string) => Promise<AudioBufferSourceNode | null>
  dispose: () => void
}

// ─── Composable ─────────────────────────────────────────────

export function useSoundManager(): UseSoundManagerReturn {
  const settingsStore = useSettingsStore()
  const manager = getSharedManager()
  const audioUnlocked = ref(false)
  const loadingProgress: Ref<number> = ref(0)
  const isActive = ref(false)

  // ── Volume sync ──────────────────────────────────────────

  function syncVolumes(): void {
    const master = settingsStore.masterVolume
    const sound = settingsStore.soundVolume
    const music = settingsStore.musicVolume
    const ui = settingsStore.uiVolume

    manager.setGlobalVolume(master)
    manager.setChannelVolume('sfx', sound)
    manager.setChannelVolume('music', music)
    manager.setChannelVolume('ui', ui)

    isActive.value = settingsStore.soundEnabled
  }

  syncVolumes()

  watch(
    [
      () => settingsStore.masterVolume,
      () => settingsStore.soundVolume,
      () => settingsStore.musicVolume,
      () => settingsStore.uiVolume,
      () => settingsStore.soundEnabled,
    ],
    () => syncVolumes(),
  )

  // ── iOS / Capacitor unlock ───────────────────────────────

  async function unlock(): Promise<boolean> {
    if (audioUnlocked.value) return true
    const ctx = manager.getContext()
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        return false
      }
    }

    if (manager.isMobile()) {
      try {
        const empty = ctx.createBuffer(1, 1, ctx.sampleRate)
        const source = ctx.createBufferSource()
        source.buffer = empty
        source.connect(ctx.destination)
        source.start()
      } catch {
        // ignored
      }
    }

    audioUnlocked.value = ctx.state === 'running'
    return audioUnlocked.value
  }

  const interactionHandler = async () => {
    await unlock()
  }
  window.addEventListener('pointerdown', interactionHandler, { once: true })
  window.addEventListener('keydown', interactionHandler, { once: true })

  // ── Play event (with lazy-load support) ──────────────────

  async function playEvent(event: SoundEvent, channel?: SoundChannel): Promise<AudioBufferSourceNode | null> {
    if (!settingsStore.soundEnabled) return null

    const preset = soundEventMap[event]
    if (!preset) return null

    const defChannel = channel ?? preset.channel
    const path = getRandomPath(event)
    if (!path) return null

    const key = `${event}/${path.split('/').pop()}`

    if (!manager.isLoaded(key)) {
      await manager.load(key, path)
    }

    return manager.play(key, defChannel, {
      volume: preset.volume ?? 1,
      pitch: preset.pitch ?? 1,
      loop: preset.loop ?? false,
    }) ?? null
  }

  /** Play game SFX by legacy name */
  async function playGameSfx(name: string): Promise<AudioBufferSourceNode | null> {
    const event = gameSfxToEvent[name]
    if (!event) return null
    return playEvent(event)
  }

  /** Play shell/UI SFX by legacy name */
  async function playShellSfx(name: string): Promise<AudioBufferSourceNode | null> {
    const event = shellSfxToEvent[name]
    if (!event) return null
    return playEvent(event)
  }

  // ── Preload ──────────────────────────────────────────────

  async function preloadGame(gameId: GameId): Promise<void> {
    const paths = buildPreloadMap(gameId)
    if (Object.keys(paths).length === 0) return
    await manager.preload(paths)
  }

  async function preloadAll(): Promise<void> {
    const paths = buildFullPreloadMap()
    if (Object.keys(paths).length === 0) return
    await manager.preload(paths)
  }

  // ── Pause / Resume ───────────────────────────────────────

  function pause(): void {
    manager.pause()
  }

  function resume(): void {
    void manager.resume()
  }

  // ── Volume setter ────────────────────────────────────────

  function setVolume(channel: SoundChannel, value: number): void {
    manager.setChannelVolume(channel, value)
  }

  // ── Stop ─────────────────────────────────────────────────

  function stopAll(): void {
    manager.stop()
  }

  // ── Loading progress (poll only while loading) ───────────

  const progressInterval = setInterval(() => {
    loadingProgress.value = manager.getLoadingProgress()
  }, 100)

  // ── Cleanup ──────────────────────────────────────────────

  function dispose(): void {
    // Shared manager is not disposed per-scope
    // Only clean up event listeners
  }

  onScopeDispose(() => {
    clearInterval(progressInterval)
    window.removeEventListener('pointerdown', interactionHandler)
    window.removeEventListener('keydown', interactionHandler)
  })

  return {
    manager,
    audioUnlocked,
    loadingProgress,
    isActive,
    unlock,
    playEvent,
    playGameSfx,
    playShellSfx,
    preloadGame,
    preloadAll,
    setVolume,
    pause,
    resume,
    stopAll,
    dispose,
  }
}
