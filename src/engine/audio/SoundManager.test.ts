import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SoundManager } from './SoundManager'
import type { SoundChannel } from './SoundManager'

// ─── AudioContext Mock ──────────────────────────────────────

function createMockAudioContext(): AudioContext {
  const buffers: AudioBufferSourceNode[] = []
  const gains: GainNode[] = []

  const mockGain: GainNode = {
    gain: { setValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 1 },
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
  } as unknown as GainNode

  const mockSource = ({ buffer, loop, playbackRate, onended }: {
    buffer: AudioBuffer | null
    loop: boolean
    playbackRate: { value: number }
    onended: (() => void) | null
  }) => {
    const node = {
      buffer,
      loop,
      playbackRate,
      onended,
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
    }
    buffers.push(node as unknown as AudioBufferSourceNode)
    return node as unknown as AudioBufferSourceNode
  }

  const ctx = {
    state: 'running',
    currentTime: 0,
    createGain: vi.fn(() => { gains.push(mockGain); return mockGain }),
    createBufferSource: vi.fn((params) => mockSource(params)),
    decodeAudioData: vi.fn(async (data: ArrayBuffer) => {
      const mockBuffer = {
        sampleRate: 44100,
        length: data.byteLength,
        duration: 1.0,
        getChannelData: vi.fn(() => new Float32Array(44100)),
      }
      return mockBuffer as unknown as AudioBuffer
    }),
    resume: vi.fn(async () => {}),
    suspend: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    destination: { connect: vi.fn(), disconnect: vi.fn() },
  } as unknown as AudioContext

  return ctx
}

// ─── Tests ──────────────────────────────────────────────────

describe('SoundManager', () => {
  let ctx: AudioContext
  let manager: SoundManager

  beforeEach(() => {
    vi.restoreAllMocks()
    ctx = createMockAudioContext()
    manager = new SoundManager(ctx)
  })

  describe('platform detection', () => {
    it('detects platform on construction', () => {
      const platform = manager.getPlatform()
      expect(['web', 'ios', 'android', 'unknown']).toContain(platform)
    })

    it('isMobile returns boolean based on platform', () => {
      const result = manager.isMobile()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('loading', () => {
    it('returns false for unloaded key', () => {
      expect(manager.isLoaded('test')).toBe(false)
    })

    it('returns progress 0 when nothing loaded', () => {
      expect(manager.getLoadingProgress()).toBe(0)
    })

    it('reports not loading when idle', () => {
      expect(manager.isLoading()).toBe(false)
    })
  })

  describe('volume control', () => {
    it('sets global volume', () => {
      manager.setGlobalVolume(0.5)
      expect(manager.getEffectiveVolume('sfx')).toBeLessThanOrEqual(0.5)
    })

    it('sets channel volume', () => {
      manager.setChannelVolume('sfx', 0.8)
      expect(manager.getEffectiveVolume('sfx')).toBeLessThanOrEqual(0.8)
    })

    it('clamps volume to 0-1 range', () => {
      manager.setGlobalVolume(-0.5)
      manager.setGlobalVolume(1.5)
      expect(manager.getEffectiveVolume('music')).toBeLessThanOrEqual(1)
    })
  })

  describe('configuration', () => {
    it('sets and gets config for a key', () => {
      manager.setConfig('test', { volume: 0.7, pitch: 1.5, fadeDuration: 200 })
      const config = manager.getConfig('test')
      expect(config.volume).toBe(0.7)
      expect(config.pitch).toBe(1.5)
      expect(config.fadeDuration).toBe(200)
    })

    it('returns default config for unknown key', () => {
      const config = manager.getConfig('unknown')
      expect(config.volume).toBe(1)
      expect(config.pitch).toBe(1)
      expect(config.fadeDuration).toBe(0)
    })
  })

  describe('playback', () => {
    it('returns null for unloaded sound', () => {
      const result = manager.play('nonexistent', 'sfx')
      expect(result).toBeNull()
    })

    it('returns null for playWithFade on unloaded sound', () => {
      const result = manager.playWithFade('nonexistent', 500, 'sfx')
      expect(result).toBeNull()
    })
  })

  describe('stop', () => {
    it('does not throw when stopping non-existent key', () => {
      expect(() => manager.stop('nonexistent')).not.toThrow()
    })

    it('does not throw when stopping all', () => {
      expect(() => manager.stop()).not.toThrow()
    })
  })

  describe('pause / resume', () => {
    it('starts unpaused', () => {
      expect(manager.isPaused()).toBe(false)
    })

    it('returns false after resume on running context', async () => {
      await manager.resume()
      expect(manager.isPaused()).toBe(false)
    })
  })

  describe('utility', () => {
    it('returns active count of 0 initially', () => {
      expect(manager.getActiveCount()).toBe(0)
    })

    it('returns empty loaded keys array initially', () => {
      expect(manager.getLoadedKeys()).toEqual([])
    })

    it('getContext returns the provided AudioContext', () => {
      expect(manager.getContext()).toBe(ctx)
    })
  })

  describe('dispose', () => {
    it('does not throw on dispose', () => {
      expect(() => manager.dispose()).not.toThrow()
    })

    it('clears loaded keys on dispose', () => {
      manager.dispose()
      expect(manager.getLoadedKeys()).toEqual([])
    })
  })
})
