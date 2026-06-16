import { defineComponent, h, ref, onMounted, onUnmounted } from 'vue'

export interface StreakOptions {
  count: number
  x: number
  y: number
  color?: string
  speed?: number
  spread?: number
}

export interface StreakParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
  maxLife: number
}

let streakIdCounter = 0

export class StreakManager {
  private particles: StreakParticle[] = []
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  shoot(options: StreakOptions) {
    const { count, x, y, color = '#ffd700', speed = 5, spread = 0.5 } = options
    const idBase = ++streakIdCounter

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread
      const velocity = speed * (0.8 + Math.random() * 0.4)
      const life = 30 + Math.random() * 20

      this.particles.push({
        id: idBase + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: 2 + Math.random() * 3,
        life,
        maxLife: life,
      })
    }
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!
      p.life -= dt / 16.67
      p.x += p.vx * dt * 0.1
      p.y += p.vy * dt * 0.1
      p.vy += 0.1 * dt * 0.1

      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  renderFrame() {
    if (!this.ctx) return
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife)
      this.ctx.save()
      this.ctx.globalAlpha = alpha
      this.ctx.fillStyle = p.color
      this.ctx.shadowColor = p.color
      this.ctx.shadowBlur = 6
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.restore()
    }
  }

  destroy() {
    this.particles = []
    this.canvas = null
    this.ctx = null
  }
}

// Vue component wrapper
export const StreakComponent = defineComponent({
  props: {
    count: { type: Number, default: 20 },
    color: { type: String, default: '#ffd700' },
  },
  setup(props) {
    const el = ref<HTMLCanvasElement | null>(null)
    const animationId: number | null = null

    onMounted(() => {
      if (!el.value) return
      const canvas = el.value
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Draw streak lines from center
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      for (let i = 0; i < props.count; i++) {
        const angle = (Math.PI * 2 * i) / props.count
        const length = 50 + Math.random() * 100
        const endX = centerX + Math.cos(angle) * length
        const endY = centerY + Math.sin(angle) * length

        ctx.save()
        ctx.strokeStyle = props.color
        ctx.globalAlpha = 0.5 + Math.random() * 0.5
        ctx.lineWidth = 2 + Math.random() * 3
        ctx.shadowColor = props.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
        ctx.restore()
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
          zIndex: 9998,
        },
      })
  },
})
