/**
 * createGameContext — convenience factory for new games.
 *
 * Creates a GameContext (shorthand aliases + settings integration)
 * from a canvas element. Uses EngineContext under the hood.
 */
import { SpriteLoader } from './sprites/spriteLoader'
import { SpriteRenderer } from './sprites/SpriteRenderer'
import { SoundManager } from './audio/SoundManager'
import { createEngineContext } from './GameEngineExtensions'
import type { EngineContext } from './GameEngineExtensions'

/* ------------------------------------------------------------------ */
/*  GameContext                                                        */
/* ------------------------------------------------------------------ */

/**
 * High-level game context with shorthand property names.
 * Alias of EngineContext for ergonomic game code.
 */
export interface GameContext {
  /** The canvas element. */
  canvas: HTMLCanvasElement
  /** 2D rendering context. */
  ctx: CanvasRenderingContext2D
  /** PNG / sprite sheet loader. */
  loader: SpriteLoader
  /** Canvas sprite renderer (shorthand for spriteRenderer). */
  renderer: SpriteRenderer
  /** Audio playback manager (shorthand for soundManager). */
  sound: SoundManager
  /** Device pixel ratio. */
  dpr: number
  /** Canvas width in CSS pixels. */
  width: number
  /** Canvas height in CSS pixels. */
  height: number
}

/* ------------------------------------------------------------------ */
/*  createGameContext                                                  */
/* ------------------------------------------------------------------ */

/**
 * Create a GameContext from a canvas element.
 *
 * This is the recommended entry point for new games. It automatically:
 *   1. Sets up DPR-aware canvas context
 *   2. Creates a SpriteLoader with default asset base URL
 *   3. Creates a SpriteRenderer with pixel-perfect rendering
 *   4. Creates a SoundManager with iOS AudioContext unlock
 *
 * @example
 * ```ts
 * const ctx = createGameContext(canvasElement)
 * const sheet = await ctx.loader.loadSheet('player.png', { ... })
 * ctx.renderer.registerSheet('player', sheet)
 * ctx.sound.play('sfx_jump', 'sfx')
 * ```
 */
export function createGameContext(canvas: HTMLCanvasElement): GameContext {
  const engine = createEngineContext(canvas)

  return {
    canvas: engine.canvas,
    ctx: engine.ctx,
    loader: engine.loader,
    renderer: engine.spriteRenderer,
    sound: engine.soundManager,
    dpr: engine.dpr,
    width: engine.width,
    height: engine.height,
  }
}

/* ------------------------------------------------------------------ */
/*  Re-exports for convenience                                         */
/* ------------------------------------------------------------------ */

export { SpriteLoader } from './sprites/spriteLoader'
export { SpriteRenderer } from './sprites/SpriteRenderer'
export { SoundManager } from './audio/SoundManager'
export type { SpriteFrame, SpriteSheet } from './sprites/spriteLoader'
export type { RenderEffects } from './sprites/SpriteRenderer'
export type { SoundConfig, PlayOptions, SoundChannel } from './audio/SoundManager'
export type { GameContext as GameContextType } from './createGameContext'
