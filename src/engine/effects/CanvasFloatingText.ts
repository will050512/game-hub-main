/**
 * CanvasFloatingText — Floating text effect for Canvas2D.
 *
 * Text drifts upward by default, fades over lifetime, with a shadow
 * for readability. Uses a simple pool-allocated list — no GC pressure.
 */

export interface FloatingTextEntry {
  x: number
  y: number
  text: string
  color: string
  size: number
  lifetime: number
  age: number
  vy: number
  opacity: number
  active: boolean
}

export interface FloatingTextConfig {
  text: string
  x: number
  y: number
  color?: string
  size?: number
  lifetime?: number
  vy?: number
}

const DEFAULT_COLOR = '#ffffff'
const DEFAULT_SIZE = 20
const DEFAULT_LIFETIME = 1000
const DEFAULT_VY = -1.5
const MAX_FLOATING_TEXTS = 50

function createText(): FloatingTextEntry {
  return {
    x: 0,
    y: 0,
    text: '',
    color: DEFAULT_COLOR,
    size: DEFAULT_SIZE,
    lifetime: DEFAULT_LIFETIME,
    age: 0,
    vy: DEFAULT_VY,
    opacity: 1,
    active: true,
  }
}

export class CanvasFloatingText {
  private pool: FloatingTextEntry[] = []
  private active: FloatingTextEntry[] = []

  constructor() {
    // Pre-warm pool
    for (let i = 0; i < MAX_FLOATING_TEXTS; i++) {
      this.pool.push(createText())
    }
  }

  /** Spawn a floating text at position. */
  spawn(config: FloatingTextConfig): void {
    if (this.active.length >= MAX_FLOATING_TEXTS) {
      // Recycle oldest
      const oldest = this.active.shift()
      if (oldest !== undefined) {
        oldest.active = false
        this.pool.push(oldest)
      }
    }

    const t = this.pool.pop()!
    t.x = config.x
    t.y = config.y
    t.text = config.text
    t.color = config.color ?? DEFAULT_COLOR
    t.size = config.size ?? DEFAULT_SIZE
    t.lifetime = config.lifetime ?? DEFAULT_LIFETIME
    t.age = 0
    t.vy = config.vy ?? DEFAULT_VY
    t.opacity = 1
    t.active = true

    this.active.push(t)
  }

  /** Update all active texts. Dead texts return to pool. */
  update(dt: number): void {
    const dtS = dt / 1000
    let writeIdx = 0

    for (let i = 0; i < this.active.length; i++) {
      const t = this.active[i]!
      t.age += dt
      t.y += t.vy * dtS * 60

      const progress = t.age / t.lifetime
      t.opacity = Math.max(0, 1 - progress)

      if (t.age >= t.lifetime) {
        t.active = false
        this.pool.push(t)
        continue
      }

      this.active[writeIdx] = t
      writeIdx++
    }

    this.active.length = writeIdx
  }

  /** Render all active texts. */
  render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.active.length; i++) {
      const t = this.active[i]!
      if (t === undefined || !t.active) continue

      ctx.save()
      ctx.globalAlpha = Math.max(0, t.opacity)
      ctx.font = `bold ${t.size}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "Nunito", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      ctx.fillStyle = t.color
      ctx.fillText(t.text, t.x, t.y)

      ctx.restore()
    }
  }

  /** Clear all active texts and return them to pool. */
  clear(): void {
    for (let i = 0; i < this.active.length; i++) {
      const t = this.active[i]
      if (t !== undefined) {
        t.active = false
        this.pool.push(t)
      }
    }
    this.active.length = 0
  }

  get activeCount(): number {
    return this.active.length
  }
}
