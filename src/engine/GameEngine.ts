import type { GameCallbacks } from '@/types'
import { InputManager } from './InputManager'
import { GameStateMachine } from './GameStateMachine'
import { GameOverlay } from './GameOverlay'
import { getBackgroundForGame, drawBackgroundPreset } from './art/presets'
import type { GameId } from '@/types'

const TIMESTEP = 1000 / 60

export abstract class GameEngine {
  protected canvas!: HTMLCanvasElement
  protected ctx!: CanvasRenderingContext2D
  protected input!: InputManager
  protected callbacks: GameCallbacks = {}

  protected running = false
  protected paused = false
  private lastTime = 0
  private accumulator = 0
  private animFrameId = 0
  private resizeObserver: ResizeObserver | null = null
  private resizeTimer = 0

  protected width = 0
  protected height = 0
  protected dpr = 1
  private frameTick = 0
  protected pixelArtMode = false

  /** Set the canvas to pixelated rendering mode (nearest-neighbor, no smoothing) */
  setPixelArt(enabled: boolean) {
    this.pixelArtMode = enabled
    this.canvas.style.imageRendering = enabled ? 'pixelated' : 'auto'
    this.ctx.imageSmoothingEnabled = !enabled
  }

  /** State machine for menu → intro → playing → gameover transitions */
  protected stateMachine: GameStateMachine = new GameStateMachine()

  /** Unified overlay for intro countdown, game-over overlay, etc. */
  protected overlay: GameOverlay = new GameOverlay()

  /** Game ID used to select the correct background preset */
  protected gameId: GameId = 'survivor'

  start(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.callbacks = callbacks
    this.input = new InputManager(canvas)

    this.dpr = window.devicePixelRatio || 1
    this.syncCanvasToParent()

    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = window.setTimeout(() => {
        this.syncCanvasToParent()
        this.onResize(this.width, this.height)
      }, 250)
    })
    if (this.canvas.parentElement) {
      this.resizeObserver.observe(this.canvas.parentElement)
    }

    this.running = true
    this.paused = false
    this.init()
    this.lastTime = performance.now()
    this.accumulator = 0
    this.animFrameId = requestAnimationFrame(this.loop)
  }

  private syncCanvasToParent() {
    const parent = this.canvas.parentElement
    const w = parent ? parent.clientWidth : this.canvas.clientWidth || 320
    const h = parent ? parent.clientHeight : this.canvas.clientHeight || 480
    this.canvas.width = w * this.dpr
    this.canvas.height = h * this.dpr
    this.canvas.style.width = w + 'px'
    this.canvas.style.height = h + 'px'
    this.width = w * this.dpr
    this.height = h * this.dpr
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.animFrameId)
    this.resizeObserver?.disconnect()
    this.resizeObserver = null
    clearTimeout(this.resizeTimer)
    this.input?.destroy()
  }

  pause() {
    if (this.paused) return
    this.paused = true
    this.callbacks.onPause?.()
  }

  resume() {
    if (!this.paused) return
    this.paused = false
    this.lastTime = performance.now()
    this.accumulator = 0
    this.callbacks.onResume?.()
  }

  resize(w: number, h: number) {
    this.canvas.width = w * this.dpr
    this.canvas.height = h * this.dpr
    this.width = w * this.dpr
    this.height = h * this.dpr
  }

  protected onResize(_width: number, _height: number): void {
    // Subclasses override to handle resize (recalculate entity positions, etc.)
  }

  private updateSize() {
    this.width = this.canvas.width
    this.height = this.canvas.height
  }

  private loop = (now: number) => {
    if (!this.running) return

    const delta = now - this.lastTime
    this.lastTime = now

    if (!this.paused) {
      this.accumulator += Math.min(delta, 250)

      while (this.accumulator >= TIMESTEP) {
        this.update(TIMESTEP)
        this.accumulator -= TIMESTEP
      }
    }

    // Update state machine (intro countdown, etc.)
    this.stateMachine.update(this.paused ? 0 : (now - (this.lastTime - delta)))

    this.frameTick = now

    // Draw game-specific background preset (not generic kawaii background)
    const bgPreset = getBackgroundForGame(this.gameId)
    drawBackgroundPreset(this.ctx, bgPreset, this.width, this.height, this.frameTick)

    // Render the game's own visual layer
    this.render(this.ctx)

    // Render unified overlay on top (intro countdown, game-over)
    this.overlay.render(this.ctx, {
      state: this.stateMachine.getState(),
      score: 0,
      level: 1,
      lives: 3,
      maxLives: 3,
      gameTime: 0,
      gameName: '',
      gameColor: '#06b6d4',
      introProgress: this.stateMachine.getIntroProgress(),
      dpr: this.dpr,
    })

    this.animFrameId = requestAnimationFrame(this.loop)
  }

  protected abstract init(): void
  protected abstract update(dt: number): void
  protected abstract render(ctx: CanvasRenderingContext2D): void
}
