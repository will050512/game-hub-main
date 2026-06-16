/**
 * CanvasFlashOverlay — Full-screen flash effect for Canvas2D.
 *
 * Draws a semi-transparent overlay that decays exponentially over time.
 * Used for hit impacts, score events, and dramatic moments.
 * Safe to chain — calling trigger() while already active resets the timer.
 */

export interface FlashConfig {
  /** CSS color string (default: '#ffffff') */
  color: string
  /** Initial alpha (default: 0.3) */
  alpha: number
  /** Duration in ms (default: 150) */
  duration: number
}

const DEFAULT_COLOR = '#ffffff'
const DEFAULT_ALPHA = 0.3
const DEFAULT_DURATION = 150

export class CanvasFlashOverlay {
  active = false
  private _alpha = 0
  private _color = DEFAULT_COLOR
  private _decay = 0.9
  private _duration = DEFAULT_DURATION

  /** Start or reset a flash overlay. */
  trigger(config: Partial<FlashConfig> = {}): void {
    if (config.color) this._color = config.color
    if (config.alpha !== undefined) this._alpha = config.alpha
    if (config.duration !== undefined) {
      this._duration = config.duration
      this._decay = Math.pow(0.5, 1 / (config.duration / 16))
    }

    this.active = true
  }

  /** Update decay. Call each frame. */
  update(dt: number): void {
    if (!this.active) return

    this._alpha *= this._decay

    if (this._alpha < 0.01) {
      this.active = false
      this._alpha = 0
    }
    void dt
  }

  /** Render the flash overlay on top of game content. */
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (!this.active || this._alpha < 0.01) return

    ctx.save()
    ctx.globalAlpha = this._alpha
    ctx.fillStyle = this._color
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  }

  /** Clear the flash immediately. */
  clear(): void {
    this.active = false
    this._alpha = 0
    this._color = DEFAULT_COLOR
  }
}
