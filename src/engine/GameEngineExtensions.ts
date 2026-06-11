/**
 * GameEngineExtensions — mixin utilities for GameEngine.
 *
 * Provides functions to add SpriteRenderer and SoundManager to a GameEngine
 * context without modifying GameEngine's abstract class or breaking existing
 * inheritance chains.
 *
 * Usage pattern:
 *   const ctx = createEngineContext(canvas)
 *   // ctx.spriteRenderer, ctx.soundManager, ctx.loader are ready
 */
import type { GameEngine } from './GameEngine'
import { SpriteRenderer } from './sprites/SpriteRenderer'
import { SpriteLoader } from './sprites/spriteLoader'
import { SoundManager } from './audio/SoundManager'

/* ------------------------------------------------------------------ */
/*  EngineContext                                                      */
/* ------------------------------------------------------------------ */

/**
 * Aggregate of engine services created alongside a canvas.
 * New games should prefer constructing this once and passing it around
 * rather than instantiating services individually.
 */
export interface EngineContext {
  /** Canvas element used by the engine. */
  canvas: HTMLCanvasElement
  /** 2D rendering context. */
  ctx: CanvasRenderingContext2D
  /** PNG / sprite sheet loader. */
  loader: SpriteLoader
  /** Canvas sprite renderer. */
  spriteRenderer: SpriteRenderer
  /** Audio playback manager. */
  soundManager: SoundManager
  /** Device pixel ratio. */
  dpr: number
  /** Canvas width in CSS pixels. */
  width: number
  /** Canvas height in CSS pixels. */
  height: number
}

/* ------------------------------------------------------------------ */
/*  withSpriteRenderer                                                 */
/* ------------------------------------------------------------------ */

/**
 * Create a SpriteRenderer that shares the GameEngine's canvas context.
 * Does NOT modify the engine instance — returns a standalone renderer.
 *
 * @param engine - A started GameEngine (must have ctx initialized)
 * @param loader - SpriteLoader instance for loading assets
 * @param opts - Optional renderer configuration
 */
export function withSpriteRenderer(
  engine: GameEngine,
  loader: SpriteLoader,
  opts?: { pixelPerfect?: boolean },
): SpriteRenderer {
  // Access protected ctx via a type-safe cast — this is safe because
  // GameEngine always initializes ctx in start() before any render call.
  const ctx = (engine as unknown as { ctx: CanvasRenderingContext2D }).ctx
  return new SpriteRenderer(loader, ctx, opts)
}

/* ------------------------------------------------------------------ */
/*  withSoundManager                                                   */
/* ------------------------------------------------------------------ */

/**
 * Attach a SoundManager to an EngineContext and wire it up to respect
 * the game's audio pause/resume lifecycle.
 *
 * @param engine - A started GameEngine
 * @param soundManager - Pre-instantiated SoundManager
 * @returns A callback object for pause/resume/dispose
 */
export interface SoundIntegration {
  /** Call when the game is paused. */
  pause: () => void
  /** Call when the game resumes. */
  resume: () => Promise<void>
  /** Call when the game stops / canvas is destroyed. */
  dispose: () => void
}

export function withSoundManager(
  _engine: GameEngine,
  soundManager: SoundManager,
): SoundIntegration {
  return {
    pause: () => soundManager.pause(),
    resume: () => soundManager.resume(),
    dispose: () => soundManager.dispose(),
  }
}

/* ------------------------------------------------------------------ */
/*  createEngineContext                                                */
/* ------------------------------------------------------------------ */

/**
 * Full options for creating an EngineContext.
 */
export interface EngineContextOptions {
  /** Base URL for sprite assets (default: '/assets/'). */
  assetBaseUrl?: string
  /** CORS for sprite images. */
  crossOrigin?: string | null
  /** Pixel-perfect rendering (default: true). */
  pixelPerfect?: boolean
  /** Pre-existing AudioContext (default: creates new one). */
  audioContext?: AudioContext
}

/**
 * Create a complete EngineContext from a canvas element.
 * Initializes SpriteLoader, SpriteRenderer, and SoundManager.
 * Handles DPR detection and AudioContext creation (including iOS unlock).
 *
 * @param canvas - The canvas element for the game
 * @param opts - Optional configuration
 */
export function createEngineContext(
  canvas: HTMLCanvasElement,
  opts?: EngineContextOptions,
): EngineContext {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context not available')
  }

  const dpr = window.devicePixelRatio || 1
  const width = canvas.clientWidth || 320
  const height = canvas.clientHeight || 480

  // SpriteLoader
  const loader = new SpriteLoader({
    baseUrl: opts?.assetBaseUrl ?? '/assets/',
    crossOrigin: opts?.crossOrigin ?? 'anonymous',
  })

  // SpriteRenderer
  const spriteRenderer = new SpriteRenderer(loader, ctx, {
    pixelPerfect: opts?.pixelPerfect ?? true,
  })

  // SoundManager
  const audioCtx = opts?.audioContext ?? createAudioContext()
  const soundManager = new SoundManager(audioCtx)

  return {
    canvas,
    ctx,
    loader,
    spriteRenderer,
    soundManager,
    dpr,
    width,
    height,
  }
}

/* ------------------------------------------------------------------ */
/*  AudioContext Helpers                                               */
/* ------------------------------------------------------------------ */

/**
 * Create an AudioContext with proper browser compatibility.
 * On iOS, AudioContext is suspended until user interaction — this function
 * returns a context that will be resumed on the next gesture.
 */
function createAudioContext(): AudioContext {
  const AudioCtx = window.AudioContext || (window as unknown as Record<string, typeof AudioContext>).webkitAudioContext
  if (!AudioCtx) {
    throw new Error('Web Audio API not supported')
  }
  const ctx = new AudioCtx()

  // Auto-resume on first user gesture (iOS requirement)
  const resumeOnce = (): void => {
    ctx.resume()
    document.removeEventListener('touchstart', resumeOnce)
    document.removeEventListener('click', resumeOnce)
  }
  document.addEventListener('touchstart', resumeOnce, { once: true })
  document.addEventListener('click', resumeOnce, { once: true })

  return ctx
}
