/**
 * CanvasScreenShake — Canvas2D screen shake effect.
 *
 * Translates the canvas context with a sinusoidal pattern that decays
 * over the configured duration. Safe to chain — calling trigger() while
 * already active extends the duration.
 */

export interface ShakeConfig {
  /** Maximum offset in pixels (default: 5) */
  intensity: number
  /** Duration in ms (default: 300) */
  duration: number
  /** Frequency in Hz (default: 20) */
  frequency: number
  /** Decay curve (default: 'linear') */
  decay?: 'linear' | 'exponential'
}

const DEFAULT_SHAKE: Required<ShakeConfig> = {
  intensity: 5,
  duration: 300,
  frequency: 20,
  decay: 'linear',
}

export class CanvasScreenShake {
  isActive = false
  elapsed = 0
  duration = 0
  intensity = 0
  private _active = false
  private _startTime = 0
  private _config: Required<ShakeConfig>

  constructor(config?: Partial<ShakeConfig>) {
    this._config = { ...DEFAULT_SHAKE, ...config }
  }

  /**
   * Start or extend a screen shake.
   * Calling while already active resets the timer with new config.
   */
  trigger(config?: Partial<ShakeConfig>): void {
    if (config) {
      this._config = { ...this._config, ...config }
    }
    this._active = true
    this._startTime = performance.now()
  }

  /** Called each frame with delta time in ms. */
  update(dt: number): void {
    if (!this._active) return

    this.elapsed = performance.now() - this._startTime
    this.duration = this._config.duration
    this.intensity = this._config.intensity
    this.isActive = this._active
    
    if (this.elapsed >= this._config.duration) {
      this._active = false
    }
    // dt is consumed to match GameEngine interface; elapsed is absolute
    void dt
  }

  /**
   * Apply the shake offset to a canvas context.
   * Must be called AFTER ctx.save() and BEFORE ctx.restore().
   */
  apply(ctx: CanvasRenderingContext2D): void {
    if (!this._active) return

    const elapsed = performance.now() - this._startTime
    const progress = elapsed / this._config.duration
    if (progress >= 1) return

    // Decay: linear or exponential
    const decay = this._config.decay === 'exponential'
      ? Math.pow(1 - progress, 2)
      : 1 - progress

    // Sinusoidal offset with frequency
    const phase = elapsed / 1000 * this._config.frequency
    const offsetX = Math.sin(phase * Math.PI * 2) * this._config.intensity * decay
    const offsetY = Math.cos(phase * Math.PI * 1.7) * this._config.intensity * decay

    ctx.translate(offsetX, offsetY)
  }
}
