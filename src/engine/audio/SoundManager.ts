/**
 * SoundManager — Kenney OGG audio playback engine.
 *
 * Loads .ogg files via Web Audio API, supports per-channel volume,
 * sound pooling for overlapping playback, fade in/out, and Capacitor
 * platform detection.
 */

export interface SoundConfig {
  /** Per-sound volume multiplier (0–1) */
  volume: number
  /** Playback rate (0.25–4.0, 1.0 = normal) */
  pitch: number
  /** Fade duration in milliseconds */
  fadeDuration: number
}

export interface PlayOptions extends Partial<SoundConfig> {
  loop?: boolean
}

export type SoundChannel = 'music' | 'sfx' | 'ui'

interface ActiveSound {
  source: AudioBufferSourceNode
  gainNode: GainNode
  channel: SoundChannel
}

interface ChannelVolumes {
  music: number
  sfx: number
  ui: number
}

export class SoundManager {
  /** All loaded audio buffers keyed by their logical key */
  private buffers: Map<string, AudioBuffer> = new Map()

  /** Active playing sounds */
  private active: Map<string, ActiveSound[]> = new Map()

  /** Per-sound default configuration */
  private configs: Map<string, SoundConfig> = new Map()

  /** Master volume (0–1) */
  private globalVolume = 1.0

  /** Per-channel volumes (0–1) */
  private channelVolumes: ChannelVolumes = { music: 1, sfx: 1, ui: 1 }

  /** Maximum simultaneous voices per sound key */
  private maxVoices: number

  /** Loading state for progress tracking */
  private loadTotal = 0
  private loadCompleted = 0
  private loadingKeys: Set<string> = new Set()

  /** Gain nodes for each channel */
  private channelGainNodes: Map<SoundChannel, GainNode> = new Map()

  /** Master gain node */
  private masterGain: GainNode | null = null

  /** Is the context suspended? */
  private paused = false

  /** Capacitor platform detection */
  private platform: 'web' | 'ios' | 'android' | 'unknown' = 'unknown'

  public constructor(private audioContext: AudioContext) {
    this.maxVoices = 8
    this.detectPlatform()
  }

  // ─── Platform Detection ───────────────────────────────────

  private detectPlatform(): void {
    if (typeof navigator === 'undefined') return
    const ua = navigator.userAgent

    if (typeof (window as unknown as Record<string, unknown>).__CAPACITOR !== 'undefined' ||
        (ua.includes('Capacitor') && ua.includes('iOS'))) {
      this.platform = 'ios'
    } else if (ua.includes('Capacitor') && ua.includes('Android')) {
      this.platform = 'android'
    } else if (ua.includes('Android')) {
      this.platform = 'android'
    } else if (/iPad|iPhone|iPod/.test(ua)) {
      this.platform = 'ios'
    } else {
      this.platform = 'web'
    }
  }

  /** Returns detected platform */
  public getPlatform(): 'web' | 'ios' | 'android' | 'unknown' {
    return this.platform
  }

  /** Whether running on a mobile (Capacitor) platform */
  public isMobile(): boolean {
    return this.platform === 'ios' || this.platform === 'android'
  }

  // ─── Gain Node Setup ──────────────────────────────────────

  private ensureMasterGain(): GainNode {
    if (!this.masterGain) {
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = this.globalVolume
      this.masterGain.connect(this.audioContext.destination)
    }
    return this.masterGain
  }

  private getChannelGain(channel: SoundChannel): GainNode {
    let gain = this.channelGainNodes.get(channel)
    if (!gain) {
      gain = this.audioContext.createGain()
      gain.gain.value = this.channelVolumes[channel]
      gain.connect(this.ensureMasterGain())
      this.channelGainNodes.set(channel, gain)
    }
    return gain
  }

  // ─── Loading ──────────────────────────────────────────────

  /**
   * Load an OGG file from a URL into the audio buffer cache.
   * Returns the decoded AudioBuffer on success.
   */
  public async load(key: string, path: string): Promise<AudioBuffer> {
    if (this.buffers.has(key)) {
      return this.buffers.get(key)!
    }

    this.loadTotal++
    this.loadingKeys.add(key)

    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${path} (${response.status})`)
      }
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.buffers.set(key, audioBuffer)
      this.loadCompleted++
      return audioBuffer
    } finally {
      this.loadingKeys.delete(key)
    }
  }

  /**
   * Batch preload multiple sound files.
   * Paths map: { key: 'url' }
   */
  public async preload(paths: Record<string, string>): Promise<void> {
    this.loadTotal += Object.keys(paths).length

    const promises = Object.entries(paths).map(async ([key, path]) => {
      if (this.buffers.has(key)) {
        this.loadCompleted++
        return
      }
      await this.load(key, path)
    })

    await Promise.allSettled(promises)
  }

  /** Whether a sound key has been loaded */
  public isLoaded(key: string): boolean {
    return this.buffers.has(key)
  }

  /** Returns loading progress as 0–1 */
  public getLoadingProgress(): number {
    if (this.loadTotal === 0) return 0
    return Math.min(1, this.loadCompleted / this.loadTotal)
  }

  /** Whether any sounds are currently loading */
  public isLoading(): boolean {
    return this.loadingKeys.size > 0
  }

  // ─── Configuration ────────────────────────────────────────

  /** Set default configuration for a sound key */
  public setConfig(key: string, config: Partial<SoundConfig>): void {
    const existing = this.configs.get(key) ?? { volume: 1, pitch: 1, fadeDuration: 0 }
    this.configs.set(key, { ...existing, ...config })
  }

  /** Get effective config for a key */
  public getConfig(key: string): SoundConfig {
    return this.configs.get(key) ?? { volume: 1, pitch: 1, fadeDuration: 0 }
  }

  /** Set max simultaneous voices for a key */
  public setMaxVoices(key: string, count: number): void {
    this.maxVoices = Math.max(1, count)
  }

  // ─── Volume Control ───────────────────────────────────────

  /** Set global master volume (0–1) */
  public setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume))
    const master = this.masterGain
    if (master) {
      master.gain.setTargetAtTime(this.globalVolume, this.audioContext.currentTime, 0.02)
    }
  }

  /** Set per-channel volume (0–1) */
  public setChannelVolume(channel: SoundChannel, volume: number): void {
    const v = Math.max(0, Math.min(1, volume))
    this.channelVolumes[channel] = v
    const gain = this.channelGainNodes.get(channel)
    if (gain) {
      gain.gain.setTargetAtTime(v, this.audioContext.currentTime, 0.02)
    }
  }

  /** Get effective volume for a channel (global × channel) */
  public getEffectiveVolume(channel: SoundChannel): number {
    return this.globalVolume * this.channelVolumes[channel]
  }

  // ─── Playback ─────────────────────────────────────────────

  /**
   * Play a loaded sound.
   * Returns the created source node.
   * Supports overlapping playback up to maxVoices.
   */
  public play(
    key: string,
    channel: SoundChannel = 'sfx',
    options: PlayOptions = {},
  ): AudioBufferSourceNode | null {
    const buffer = this.buffers.get(key)
    if (!buffer) return null

    const config = this.getConfig(key)
    const volume = options.volume ?? config.volume
    const pitch = options.pitch ?? config.pitch
    const loop = options.loop ?? false
    const fadeDuration = options.fadeDuration ?? config.fadeDuration

    const voices = this.active.get(key) ?? []

    // If at max voices and looping, reuse first voice
    if (voices.length >= this.maxVoices && loop) {
      const oldest = voices[0]!
      try {
        oldest.source.stop()
      } catch {
        // already stopped
      }
      oldest.gainNode.disconnect()
      oldest.source.disconnect()
      voices.shift()
    }

    // Stop oldest if over limit (non-looping)
    if (voices.length >= this.maxVoices && !loop) {
      const oldest = voices[0]!
      try {
        oldest.source.stop()
      } catch {
        // already stopped
      }
      oldest.gainNode.disconnect()
      oldest.source.disconnect()
      voices.shift()
    }

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = pitch
    source.loop = loop

    const gainNode = this.audioContext.createGain()
    const effectiveVolume = this.globalVolume * this.channelVolumes[channel] * volume
    const now = this.audioContext.currentTime

    if (fadeDuration > 0) {
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(effectiveVolume, now + fadeDuration / 1000)
    } else {
      gainNode.gain.setValueAtTime(effectiveVolume, now)
    }

    source.connect(gainNode)
    gainNode.connect(this.getChannelGain(channel))

    const activeEntry: ActiveSound = { source, gainNode, channel }
    if (!this.active.has(key)) {
      this.active.set(key, [])
    }
    this.active.get(key)!.push(activeEntry)

    source.onended = () => {
      const list = this.active.get(key)
      if (list) {
        const idx = list.indexOf(activeEntry)
        if (idx !== -1) list.splice(idx, 1)
      }
      gainNode.disconnect()
      source.disconnect()
    }

    source.start()
    return source
  }

  /**
   * Play a sound with fade in and fade out.
   */
  public playWithFade(
    key: string,
    fadeDuration: number,
    channel: SoundChannel = 'sfx',
    options: PlayOptions = {},
  ): AudioBufferSourceNode | null {
    const buffer = this.buffers.get(key)
    if (!buffer) return null

    const config = this.getConfig(key)
    const volume = options.volume ?? config.volume
    const pitch = options.pitch ?? config.pitch

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = pitch
    source.loop = false

    const gainNode = this.audioContext.createGain()
    const effectiveVolume = this.globalVolume * this.channelVolumes[channel] * volume
    const now = this.audioContext.currentTime
    const fadeSec = fadeDuration / 1000
    const halfDuration = Math.min(buffer.duration / 2, fadeSec)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(effectiveVolume, now + fadeSec)
    // Fade out before end
    if (buffer.duration > fadeSec * 2) {
      gainNode.gain.setValueAtTime(effectiveVolume, now + buffer.duration - fadeSec)
      gainNode.gain.linearRampToValueAtTime(0, now + buffer.duration)
    }

    source.connect(gainNode)
    gainNode.connect(this.getChannelGain(channel))

    const activeEntry: ActiveSound = { source, gainNode, channel }
    const voices = this.active.get(key) ?? []

    if (voices.length >= this.maxVoices) {
      const oldest = voices[0]!
      try {
        oldest.source.stop()
      } catch {
        // already stopped
      }
      oldest.gainNode.disconnect()
      oldest.source.disconnect()
      voices.shift()
    }

    if (!this.active.has(key)) {
      this.active.set(key, [])
    }
    this.active.get(key)!.push(activeEntry)

    source.onended = () => {
      const list = this.active.get(key)
      if (list) {
        const idx = list.indexOf(activeEntry)
        if (idx !== -1) list.splice(idx, 1)
      }
      gainNode.disconnect()
      source.disconnect()
    }

    source.start()
    return source
  }

  // ─── Stop / Pause / Resume ────────────────────────────────

  /** Stop playback of a specific sound key, or all if no key given */
  public stop(key?: string): void {
    if (key) {
      const voices = this.active.get(key)
      if (!voices) return
      for (const v of voices) {
        try {
          v.source.stop()
        } catch {
          // already stopped
        }
        v.gainNode.disconnect()
        v.source.disconnect()
      }
      this.active.delete(key)
    } else {
      this.active.forEach((voices) => {
        for (const v of voices) {
          try {
            v.source.stop()
          } catch {
            // already stopped
          }
          v.gainNode.disconnect()
          v.source.disconnect()
        }
      })
      this.active.clear()
    }
  }

  /** Pause the audio context */
  public pause(): void {
    if (this.audioContext.state === 'running') {
      this.audioContext.suspend()
      this.paused = true
    }
  }

  /** Resume the audio context */
  public async resume(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    this.paused = false
  }

  /** Whether audio is currently paused */
  public isPaused(): boolean {
    return this.paused
  }

  // ─── Utility ──────────────────────────────────────────────

  /** Number of currently playing sounds */
  public getActiveCount(): number {
    let count = 0
    this.active.forEach((voices) => { count += voices.length })
    return count
  }

  /** Get the AudioContext (for advanced usage) */
  public getContext(): AudioContext {
    return this.audioContext
  }

  /** Get all loaded buffer keys */
  public getLoadedKeys(): string[] {
    return Array.from(this.buffers.keys())
  }

  /** Remove a loaded buffer from cache */
  public unload(key: string): void {
    this.stop(key)
    this.buffers.delete(key)
    this.configs.delete(key)
  }

  /** Clear all buffers and stop all playback */
  public dispose(): void {
    this.stop()
    this.buffers.clear()
    this.configs.clear()
    this.active.clear()
    this.loadTotal = 0
    this.loadCompleted = 0
    this.loadingKeys.clear()

    const master = this.masterGain
    if (master) {
      master.disconnect()
      this.masterGain = null
    }

    this.channelGainNodes.forEach((gain) => { gain.disconnect() })
    this.channelGainNodes.clear()
  }
}
