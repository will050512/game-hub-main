import { defineComponent, h, ref, onMounted, onUnmounted } from 'vue'

export interface ConfettiParticle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  opacity: number
  rotation: number
  rotationSpeed: number
}

const COLORS = ['#ff6b9d', '#ffd700', '#00d4ff', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#feca57']

export class ConfettiManager {
  private particles: ConfettiParticle[] = []
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  burst(x: number, y: number, count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = 3 + Math.random() * 5
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const size = 3 + Math.random() * 6

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: color!,
        size,
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      })
    }
  }

  celebrate(count = 60) {
    const canvas = this.canvas
    if (!canvas) return
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width
      const y = -10 - Math.random() * 50
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const size = 4 + Math.random() * 8

      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 3,
        color: color!,
        size,
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
      })
    }
  }

  private renderParticle(ctx: CanvasRenderingContext2D, p: ConfettiParticle) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, p.opacity)
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
    ctx.restore()
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!
      p.vy += 0.1 * dt
      p.vx *= 0.99
      p.x += p.vx * dt * 0.3
      p.y += p.vy * dt * 0.3
      p.rotation += p.rotationSpeed * dt
      p.opacity -= 0.001 * dt

      if (p.opacity <= 0 || p.y > (this.canvas?.height ?? 600) + 50) {
        this.particles.splice(i, 1)
      }
    }
  }

  renderFrame() {
    if (!this.ctx) return
    for (const p of this.particles) {
      this.renderParticle(this.ctx, p)
    }
  }

  destroy() {
    this.particles = []
    this.canvas = null
    this.ctx = null
  }
}

// Vue component wrapper
export const ConfettiComponent = defineComponent({
  props: {
    count: { type: Number, default: 50 },
    autoTrigger: { type: Boolean, default: true },
  },
  setup(props) {
    const el = ref<HTMLCanvasElement | null>(null)
    const animationId: number | null = null

    const animate = () => {
      if (!el.value) return
      const canvas = el.value
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Draw confetti
      for (let i = 0; i < props.count; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const color = COLORS[Math.floor(Math.random() * COLORS.length)]
        const size = 4 + Math.random() * 8

        ctx.save()
        ctx.globalAlpha = 0.6 + Math.random() * 0.4
        ctx.translate(x, y)
        ctx.rotate(Math.random() * Math.PI * 2)
        ctx.fillStyle = color!
        ctx.fillRect(-size / 2, -size / 2, size, size * 0.6)
        ctx.restore()
      }
    }

    onMounted(() => {
      if (props.autoTrigger) {
        animate()
      }
    })

    onUnmounted(() => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
      }
    })

    return () =>
      h('canvas', {
        ref: el,
        style: {
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9999,
        },
      })
  },
})
