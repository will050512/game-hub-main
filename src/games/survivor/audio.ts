import { useSettingsStore } from '@/stores/settingsStore'

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

interface MusicNode {
  oscillator: OscillatorNode
  gain: GainNode
}

interface AudioSample {
  buffer: AudioBuffer
  name: string
}

export const SURVIVOR_AUDIO_TUNING = {
  musicBusGain: 0.2,
  sampleGainMultiplier: 1.35,
  synthGainMultiplier: 1.35,
} as const

export class SurvivorAudioManager {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private musicNodes: MusicNode[] = []
  private musicStarted = false
  private musicTimer: ReturnType<typeof window.setTimeout> | null = null

  private loadedSamples: Map<string, AudioBuffer> = new Map()
  private sampleLoaderAttempts: Set<string> = new Set()
  private samplesBasePath = '/audio/survivor/'

  private isSoundEnabled(): boolean {
    return useSettingsStore().soundEnabled
  }

  private isMusicEnabled(): boolean {
    return useSettingsStore().musicEnabled
  }

  private getSoundVolume(): number {
    return useSettingsStore().soundVolume
  }

  private getMusicVolume(): number {
    return useSettingsStore().musicVolume
  }

  private syncVolumes(): void {
    if (this.masterGain) {
      this.masterGain.gain.value = useSettingsStore().masterVolume
    }
    if (this.musicGain) {
      this.musicGain.gain.value = SURVIVOR_AUDIO_TUNING.musicBusGain * this.getMusicVolume()
    }
  }

  private async loadAudioSample(name: string): Promise<AudioBuffer | null> {
    if (this.loadedSamples.has(name)) {
      return this.loadedSamples.get(name) ?? null
    }

    if (this.sampleLoaderAttempts.has(name)) {
      return null
    }
    this.sampleLoaderAttempts.add(name)

    const context = this.audioContext
    if (!context) return null

    try {
      const response = await fetch(`${this.samplesBasePath}${name}.wav`)
      if (!response.ok) {
        return null
      }
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await context.decodeAudioData(arrayBuffer)
      this.loadedSamples.set(name, audioBuffer)
      return audioBuffer
    } catch {
      return null
    }
  }

  private async playSample(name: string, volume = 0.3): Promise<void> {
    if (!this.isSoundEnabled()) return
    if (!(await this.ensureAudioContext())) return

    const sample = await this.loadAudioSample(name)
    if (!sample) {
      return
    }

    const context = this.audioContext
    const gainTarget = this.masterGain
    if (!context || !gainTarget) return

    const source = context.createBufferSource()
    source.buffer = sample

    const gainNode = context.createGain()
    gainNode.gain.value = volume * SURVIVOR_AUDIO_TUNING.sampleGainMultiplier * this.getSoundVolume()

    source.connect(gainNode)
    gainNode.connect(gainTarget)
    source.start()
  }

  private createAudioContext(): AudioContext | null {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
    if (!AudioContextClass) return null
    return new AudioContextClass()
  }

  init(): boolean {
    if (this.audioContext) return true

    try {
      const context = this.createAudioContext()
      if (!context) return false

      this.audioContext = context
      this.masterGain = context.createGain()
      this.masterGain.connect(context.destination)

      this.musicGain = context.createGain()
      this.musicGain.connect(this.masterGain)
      this.syncVolumes()

      return true
    } catch (error) {
      console.warn('Audio initialization failed:', error)
      return false
    }
  }

  async preloadSamples(): Promise<void> {
    const sampleNames = [
      'weapon_fire',
      'player_hurt',
      'enemy_hit',
      'enemy_death',
      'boss_death',
      'xp_pickup',
      'level_up',
      'boss_spawn',
      'game_over'
    ]

    for (const name of sampleNames) {
      await this.loadAudioSample(name)
    }
  }

  async unlock(): Promise<boolean> {
    return this.ensureAudioContext()
  }

  private async ensureAudioContext(): Promise<boolean> {
    if (!this.audioContext && !this.init()) {
      return false
    }

    const context = this.audioContext
    if (!context) return false

    if (context.state === 'suspended') {
      try {
        await context.resume()
      } catch (error) {
        console.warn('Could not resume audio context:', error)
        return false
      }
    }

    return context.state === 'running'
  }

  private registerMusicNode(oscillator: OscillatorNode, gain: GainNode) {
    const node: MusicNode = { oscillator, gain }
    this.musicNodes.push(node)
    oscillator.onended = () => {
      gain.disconnect()
      oscillator.disconnect()
      this.musicNodes = this.musicNodes.filter((current) => current !== node)
    }
  }

  private stopAndDisconnectMusicNodes() {
    for (const node of this.musicNodes) {
      try {
        node.oscillator.stop()
      } catch {
        // already stopped or not yet started
      }
      node.gain.disconnect()
      node.oscillator.disconnect()
    }
    this.musicNodes = []
  }

  private async playTone(
    frequency: number,
    duration: number,
    waveType: OscillatorType = 'sine',
    volume: number = 0.3,
    attack: number = 0.01,
    decay: number = 0.1,
    sustain: number = 0.7,
    release: number = 0.1,
  ): Promise<void> {
    if (!this.isSoundEnabled()) return
    if (!(await this.ensureAudioContext())) return

    const context = this.audioContext
    const gainTarget = this.masterGain
    if (!context || !gainTarget) return

    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const scaledVolume = volume * SURVIVOR_AUDIO_TUNING.synthGainMultiplier * this.getSoundVolume()

    oscillator.type = waveType
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(scaledVolume, now + attack)
    gainNode.gain.linearRampToValueAtTime(scaledVolume * sustain, now + attack + decay)
    gainNode.gain.setValueAtTime(scaledVolume * sustain, now + Math.max(attack + decay, duration - release))
    gainNode.gain.linearRampToValueAtTime(0, now + duration)

    oscillator.connect(gainNode)
    gainNode.connect(gainTarget)
    oscillator.onended = () => {
      gainNode.disconnect()
      oscillator.disconnect()
    }

    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  private async playSweep(
    startFrequency: number,
    endFrequency: number,
    duration: number,
    waveType: OscillatorType,
    volume: number,
  ): Promise<void> {
    if (!this.isSoundEnabled()) return
    if (!(await this.ensureAudioContext())) return

    const context = this.audioContext
    const gainTarget = this.masterGain
    if (!context || !gainTarget) return

    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const scaledVolume = volume * SURVIVOR_AUDIO_TUNING.synthGainMultiplier * this.getSoundVolume()

    oscillator.type = waveType
    oscillator.frequency.setValueAtTime(startFrequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration)

    gainNode.gain.setValueAtTime(scaledVolume, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    oscillator.connect(gainNode)
    gainNode.connect(gainTarget)
    oscillator.onended = () => {
      gainNode.disconnect()
      oscillator.disconnect()
    }

    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  private async playChord(
    frequencies: number[],
    duration: number,
    waveType: OscillatorType = 'sine',
    volume: number = 0.2,
  ): Promise<void> {
    await Promise.all(frequencies.map((frequency) => this.playTone(frequency, duration, waveType, volume)))
  }

  async playWeaponFire(): Promise<void> {
    try {
      await this.playSample('weapon_fire', 0.15)
    } catch {
      await this.playTone(800, 0.08, 'square', 0.13, 0.001, 0.02, 0.3, 0.05)
    }
  }

  async playPlayerHurt(): Promise<void> {
    try {
      await this.playSample('player_hurt', 0.25)
    } catch {
      await this.playSweep(400, 200, 0.2, 'sawtooth', 0.28)
    }
  }

  async playEnemyDeath(): Promise<void> {
    try {
      await this.playSample('enemy_death', 0.2)
    } catch {
      await this.playSweep(300, 100, 0.1, 'square', 0.18)
    }
  }

  async playEnemyHit(): Promise<void> {
    try {
      await this.playSample('enemy_hit', 0.12)
    } catch {
      await this.playTone(220, 0.06, 'square', 0.1, 0.001, 0.03, 0.5, 0.02)
    }
  }

  async playSynthesis(): Promise<void> {
    try {
      await this.playSample('level_up', 0.3)
    } catch {
      if (!this.isSoundEnabled()) return
      if (!(await this.ensureAudioContext())) return

      const context = this.audioContext
      const gainTarget = this.masterGain
      if (!context || !gainTarget) return

      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i]
        const osc = context.createOscillator()
        const gain = context.createGain()
        osc.type = 'sine'
        osc.frequency.value = note
        const now = context.currentTime + i * 0.06
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.15, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
        osc.connect(gain)
        gain.connect(gainTarget)
        osc.start(now)
        osc.stop(now + 0.3)
      }
    }
  }

  async playBossDeath(): Promise<void> {
    try {
      await this.playSample('boss_death', 0.25)
    } catch {
      await this.playChord([200, 250, 300, 400], 0.6, 'sawtooth', 0.2)
    }
  }

  async playXpPickup(): Promise<void> {
    try {
      await this.playSample('xp_pickup', 0.18)
    } catch {
      await this.playSweep(600, 1200, 0.05, 'sine', 0.15)
    }
  }

  async playLevelUp(): Promise<void> {
    try {
      await this.playSample('level_up', 0.2)
    } catch {
      if (!this.isSoundEnabled()) return
      if (!(await this.ensureAudioContext())) return

      const notes = [523.25, 659.25, 783.99, 1046.5]
      for (const [index, note] of notes.entries()) {
        window.setTimeout(() => {
          void this.playTone(note, 0.15, 'sine', 0.22, 0.01, 0.05, 0.7, 0.05)
        }, index * 80)
      }
    }
  }

  async playBossSpawn(): Promise<void> {
    try {
      await this.playSample('boss_spawn', 0.25)
    } catch {
      await this.playSweep(80, 200, 0.5, 'sawtooth', 0.24)
    }
  }

  async playGameOver(): Promise<void> {
    try {
      await this.playSample('game_over', 0.2)
    } catch {
      await this.playChord([440, 349.23, 293.66], 1, 'sine', 0.18)
    }
  }

  async startMusic(): Promise<void> {
    if (!this.isMusicEnabled()) {
      this.stopMusic()
      return
    }
    if (this.musicStarted) return
    if (!(await this.ensureAudioContext())) return

    this.musicStarted = true
    void this.playMusicLoop()
  }

  stopMusic(): void {
    this.musicStarted = false
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer)
      this.musicTimer = null
    }
    this.stopAndDisconnectMusicNodes()
  }

  private async playMusicLoop(): Promise<void> {
    if (!this.musicStarted) return
    if (!this.isMusicEnabled()) {
      this.stopMusic()
      return
    }
    if (!(await this.ensureAudioContext())) return
    this.syncVolumes()

    const context = this.audioContext
    const musicTarget = this.musicGain
    if (!context || !musicTarget) return

    const now = context.currentTime + 0.02
    const loopDuration = 8

    const bassOscillator = context.createOscillator()
    const bassGain = context.createGain()
    bassOscillator.type = 'triangle'
    bassOscillator.frequency.value = 110
    bassGain.gain.value = 0.22
    bassOscillator.connect(bassGain)
    bassGain.connect(musicTarget)
    this.registerMusicNode(bassOscillator, bassGain)
    bassOscillator.start(now)
    bassOscillator.stop(now + loopDuration)

    const melody = [
      { frequency: 440, start: 0, duration: 1 },
      { frequency: 523.25, start: 1, duration: 1 },
      { frequency: 440, start: 2, duration: 1 },
      { frequency: 392, start: 3, duration: 1 },
      { frequency: 349.23, start: 4, duration: 2 },
      { frequency: 392, start: 6, duration: 2 },
    ]

    for (const note of melody) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = note.frequency

      const noteStart = now + note.start
      const noteEnd = noteStart + note.duration

      gain.gain.setValueAtTime(0, noteStart)
      gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.05)
      gain.gain.setValueAtTime(0.12, noteEnd - 0.12)
      gain.gain.linearRampToValueAtTime(0, noteEnd)

      oscillator.connect(gain)
      gain.connect(musicTarget)
      this.registerMusicNode(oscillator, gain)
      oscillator.start(noteStart)
      oscillator.stop(noteEnd)
    }

    this.musicTimer = window.setTimeout(() => {
      if (!this.musicStarted) return
      void this.playMusicLoop()
    }, loopDuration * 1000)
  }

  dispose(): void {
    this.stopMusic()
    const context = this.audioContext
    this.audioContext = null
    this.masterGain = null
    this.musicGain = null
    if (context) {
      void context.close()
    }
  }
}

export const audioManager = new SurvivorAudioManager()
