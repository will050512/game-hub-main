/**
 * CanvasComboText — Combo counter display for Canvas2D.
 *
 * Tracks combo count, auto-resets after timeout, renders large text
 * with glow that scales with combo count.
 */

export interface CanvasComboTextConfig {
  /** X position to render combo text */
  x?: number
  /** Y position to render combo text */
  y?: number
  /** Auto-reset timeout in ms (default: 2000) */
  resetTimeout?: number
  /** Base font size (default: 32) */
  baseFontSize?: number
  /** Font size increase per combo level (default: 4) */
  fontSizeStep?: number
  /** Glow color (default: '#ffd700') */
  glowColor?: string
  /** Text color (default: '#ffffff') */
  textColor?: string
  /** Combo label suffix (default: 'x') */
  suffix?: string
}

export class CanvasComboText {
  private combo: number
  private lastHitTime = 0
  private config: Required<CanvasComboTextConfig>

  constructor(config?: CanvasComboTextConfig) {
    this.combo = 0
    this.config = {
      x: 0.5,
      y: 0.25,
      resetTimeout: 2000,
      baseFontSize: 32,
      fontSizeStep: 4,
      glowColor: '#ffd700',
      textColor: '#ffffff',
      suffix: 'x',
      ...config,
    }
  }

  /** Record a hit and increment combo. */
  onHit(): void {
    this.combo++
    this.lastHitTime = performance.now()
  }

  /** Reset combo to 0. */
  onReset(): void {
    this.combo = 0
    this.lastHitTime = 0
  }

  /** Check for auto-reset. Call each frame. */
  update(_dt: number): void {
    if (this.combo > 0) {
      const elapsed = performance.now() - this.lastHitTime
      if (elapsed >= this.config.resetTimeout) {
        this.combo = 0
        this.lastHitTime = 0
      }
    }
  }

  /** Render combo text with glow effect. */
  render(ctx: CanvasRenderingContext2D): void {
    if (this.combo <= 1) return

    const fontSize = this.config.baseFontSize + this.combo * this.config.fontSizeStep

    ctx.save()
    ctx.font = `bold ${fontSize}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "Nunito", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Glow effect
    ctx.shadowColor = this.config.glowColor
    ctx.shadowBlur = 15
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    ctx.fillStyle = this.config.textColor
    ctx.fillText(`${this.combo}${this.config.suffix}`, this.config.x, this.config.y)

    ctx.restore()
  }

  /** Clear combo and reset. */
  clear(): void {
    this.combo = 0
    this.lastHitTime = 0
  }

  get currentCombo(): number {
    return this.combo
  }
}
