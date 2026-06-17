/**
 * CanvasConfetti — Canvas2D confetti effect with object pooling.
 *
 * Particles fall with gravity, rotate, and bounce off the floor.
 * Default vibrant colors for celebrations.
 */

export interface ConfettiParticle {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  color: string
  rotation: number
  rotationSpeed: number
  opacity: number
  active: boolean
  bounceCount: number
}

const CONFETTI_COLORS = ['#ffd700', '#ff69b4', '#00ff00', '#00bfff', '#ff4500', '#ff00ff']
const MAX_PARTICLES = 200
const GRAVITY = 0.15
const BOUNCE_DAMPING = 0.6
const MAX_BOUNCES = 3

function createParticle(): ConfettiParticle {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: 0,
    height: 0,
    color: '#ffd700',
    rotation: 0,
    rotationSpeed: 0,
    opacity: 1,
    active: false,
    bounceCount: 0,
  }
}

export class CanvasConfetti {
  private pool: ConfettiParticle[] = []
  private active: ConfettiParticle[] = []
  private canvasHeight = 600
  private canvasWidth = 800

  constructor() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool.push(createParticle())
    }
  }

  /** Set the canvas dimensions (for floor bounce detection and confetti origin). */
  setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width
    this.canvasHeight = height
  }

  /** Spawn a burst of confetti. */
  burst(count: number, originX?: number, originY?: number): void {
    const ox = originX ?? this.canvasWidth / 2
    const oy = originY ?? -10

    for (let i = 0; i < count; i++) {
      if (this.pool.length === 0 || this.active.length >= MAX_PARTICLES) {
        continue
      }

      const p = this.pool.pop()!
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = 3 + Math.random() * 8
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]

      p.x = ox
      p.y = oy
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed - 4
      p.width = 4 + Math.random() * 8
      p.height = 2 + Math.random() * 4
      p.color = color ?? '#ffd700'
      p.rotation = Math.random() * Math.PI * 2
      p.rotationSpeed = (Math.random() - 0.5) * 0.3
      p.opacity = 1
      p.active = true
      p.bounceCount = 0

      this.active.push(p)
    }
  }

  /** Update all confetti particles. */
  update(dt: number): void {
    const dtFactor = dt / 1000 * 60
    let writeIdx = 0

    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i]!

      p.vy += GRAVITY * dtFactor
      p.x += p.vx * dtFactor
      p.y += p.vy * dtFactor
      p.rotation += p.rotationSpeed * dtFactor
      p.vx *= 0.99

      // Floor bounce
      if (p.y > this.canvasHeight) {
        p.y = this.canvasHeight
        p.vy *= -BOUNCE_DAMPING
        p.bounceCount++

        if (p.bounceCount >= MAX_BOUNCES) {
          p.opacity -= 0.02 * dtFactor
          if (p.opacity <= 0) {
            p.active = false
            this.pool.push(p)
            continue
          }
        }
      }

      this.active[writeIdx] = p
      writeIdx++
    }

    this.active.length = writeIdx
  }

  /** Render all active confetti. */
  render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i]!
      if (p === undefined || !p.active) continue

      ctx.save()
      ctx.globalAlpha = Math.max(0, p.opacity)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
      ctx.restore()
    }
  }

  /** Clear all confetti. */
  clear(): void {
    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i]
      if (p !== undefined) {
        p.active = false
        this.pool.push(p)
      }
    }
    this.active.length = 0
  }

  get activeCount(): number {
    return this.active.length
  }
}
