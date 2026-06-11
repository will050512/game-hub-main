/**
 * CanvasParticles — Canvas2D particle system with object pooling.
 *
 * Zero GC pressure: particles are pre-allocated and recycled, never
 * collected after warm-up. Designed for 60fps with up to 500 concurrent
 * particles.
 */

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  rotation: number
  rotationSpeed: number
  lifetime: number
  age: number
  gravity: number
  active: boolean
  shape: 'circle' | 'square' | 'star'
  sizeEnd: number
  opacityStart: number
  opacityEnd: number
}

export interface EmitConfig {
  /** Number of particles to emit */
  count: number
  /** Color(s) to choose from */
  colors: string[]
  /** Speed range in world units per second */
  speed: { min: number; max: number }
  /** Size range in world units */
  size: { start: number; end: number }
  /** Lifetime in ms */
  lifetime: number
  /** Gravity (positive = downward, default: 0) */
  gravity?: number
  /** Rotation speed in degrees per second */
  rotationSpeed?: number
  /** Opacity range */
  opacity?: { start: number; end: number }
  /** Particle shape */
  shape?: 'circle' | 'square' | 'star'
}

/** Pre-built particle template — avoids allocation in emit(). */
function createParticle(): Particle {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: 0,
    color: '#ffffff',
    opacity: 0,
    rotation: 0,
    rotationSpeed: 0,
    lifetime: 0,
    age: 0,
    gravity: 0,
    active: false,
    shape: 'circle',
    sizeEnd: 0,
    opacityStart: 0,
    opacityEnd: 0,
  }
}

export class CanvasParticles {
  private pool: Particle[] = []
  private activeParticles: Particle[] = []
  private maxParticles: number

  constructor(maxParticles = 500) {
    this.maxParticles = maxParticles
    // Pre-warm pool
    for (let i = 0; i < maxParticles; i++) {
      this.pool.push(createParticle())
    }
  }

  /**
   * Emit particles from a position.
   * If pool is exhausted, oldest particles are recycled.
   */
  emit(config: Omit<EmitConfig, 'x' | 'y'>, x: number, y: number): void {
    const activeLimit = this.maxParticles

    for (let i = 0; i < config.count; i++) {
      // Acquire from pool or recycle oldest active
      let p: Particle
      if (this.pool.length > 0) {
        p = this.pool.pop()!
        this.activeParticles.push(p)
      } else if (this.activeParticles.length > 0 && this.activeParticles.length < activeLimit) {
        p = this.pool.pop()!
        this.activeParticles.push(p)
      } else {
        // Pool exhausted and at limit — skip
        continue
      }

      // Random angle and speed
      const angle = Math.random() * Math.PI * 2
      const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min)

      // Assign properties
      p.x = x
      p.y = y
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed
      p.size = config.size.start
      p.sizeEnd = config.size.end
      p.color = config.colors[Math.floor(Math.random() * config.colors.length)] ?? config.colors[0] ?? '#ffffff'
      p.opacity = config.opacity?.start ?? 1
      p.opacityStart = config.opacity?.start ?? 1
      p.opacityEnd = config.opacity?.end ?? 0
      p.rotation = Math.random() * 360
      p.rotationSpeed = (config.rotationSpeed ?? 0) * (Math.random() - 0.5) * 2
      p.lifetime = config.lifetime
      p.age = 0
      p.gravity = config.gravity ?? 0
      p.active = true
      p.shape = config.shape ?? 'circle'
    }
  }

  /** Update all active particles. Dead particles return to pool. */
  update(dt: number): void {
    const dtS = dt / 1000 // convert ms to seconds for physics
    let writeIdx = 0

    for (let i = 0; i < this.activeParticles.length; i++) {
      const p = this.activeParticles[i]
      if (p === undefined) continue

      p.age += dt

      // Check lifetime
      if (p.age >= p.lifetime) {
        p.active = false
        this.pool.push(p)
        continue
      }

      // Interpolation factor (0 → 1 over lifetime)
      const t = p.age / p.lifetime

      // Physics
      p.vy += p.gravity * dt
      p.x += p.vx * dtS * 60 // normalize to ~60fps
      p.y += p.vy * dtS * 60
      p.rotation += p.rotationSpeed * dtS * 60

      // Size interpolation
      p.size = p.sizeEnd + (p.size - p.sizeEnd) * (1 - t)

      // Opacity interpolation
      p.opacity = p.opacityStart + (p.opacityEnd - p.opacityStart) * t

      // Keep alive
      this.activeParticles[writeIdx] = p
      writeIdx++
    }

    // Truncate dead slots
    this.activeParticles.length = writeIdx
  }

  /** Render all active particles. */
  render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.activeParticles.length; i++) {
      const p = this.activeParticles[i]
      if (p === undefined || !p.active) continue

      ctx.save()
      ctx.globalAlpha = Math.max(0, p.opacity)
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillStyle = p.color

      const half = p.size / 2
      switch (p.shape) {
        case 'circle':
          ctx.beginPath()
          ctx.arc(0, 0, half, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'square':
          ctx.fillRect(-half, -half, p.size, p.size)
          break
        case 'star':
          drawStar(ctx, 0, 0, 4, half, half * 0.5)
          break
      }

      ctx.restore()
    }
  }

  /** Remove all active particles and return them to the pool. */
  clear(): void {
    for (let i = 0; i < this.activeParticles.length; i++) {
      const p = this.activeParticles[i]
      if (p !== undefined) {
        p.active = false
        this.pool.push(p)
      }
    }
    this.activeParticles.length = 0
  }

  get activeCount(): number {
    return this.activeParticles.length
  }
}

/** Draw a 4-point star centered at (cx, cy). */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  points: number,
  outerRadius: number,
  innerRadius: number,
): void {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / points - Math.PI / 2
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
  ctx.fill()
}
