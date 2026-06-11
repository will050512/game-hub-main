import { defineComponent, h, ref, onMounted, onUnmounted, computed } from 'vue'

export interface ComboTextOptions {
  text: string
  x: number
  y: number
  color?: string
  size?: number
  duration?: number
  gravity?: number
  fadeOutSpeed?: number
}

export interface ComboTextState {
  id: number
  x: number
  y: number
  vy: number
  opacity: number
  scale: number
  rotation: number
}

let idCounter = 0

export class ComboTextManager {
  private texts: ComboTextState[] = []
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private animFrameId: number | null = null
  private onRender: ((ctx: CanvasRenderingContext2D, text: string, state: ComboTextState) => void) | undefined = undefined

  initialize(canvas: HTMLCanvasElement, customRenderer?: (ctx: CanvasRenderingContext2D, text: string, state: ComboTextState) => void) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.onRender = customRenderer
  }

  add(options: ComboTextOptions) {
    const id = ++idCounter
    this.texts.push({
      id,
      x: options.x,
      y: options.y,
      vy: -(2 + Math.random() * 3),
      opacity: 1,
      scale: 1.5,
      rotation: (Math.random() - 0.5) * 0.3,
    })

    // Auto-remove after duration
    const duration = options.duration || 1500
    setTimeout(() => {
      const idx = this.texts.findIndex(t => t.id === id)
      if (idx !== -1) this.texts.splice(idx, 1)
    }, duration)

    return id
  }

  private render(ctx: CanvasRenderingContext2D, text: string, state: ComboTextState, color: string, size: number) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, state.opacity)
    ctx.translate(state.x, state.y)
    ctx.rotate(state.rotation)
    ctx.scale(state.scale, state.scale)

    // Shadow/glow
    ctx.shadowColor = color
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Text
    ctx.font = `bold ${size}px "Nunito", "Segoe UI", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.fillText(text, 0, 0)

    // Outline
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.strokeText(text, 0, 0)

    ctx.restore()
  }

  update(dt: number) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i]!
      t.vy += (0.05) * dt
      t.y += t.vy * dt * 0.6
      t.opacity -= 0.001 * dt
      t.scale = Math.max(1, t.scale - 0.003 * dt)
      t.rotation += 0.001 * dt

      if (t.opacity <= 0) {
        this.texts.splice(i, 1)
      }
    }
  }

  renderFrame() {
    if (!this.ctx || !this.canvas) return
    const ctx = this.ctx
    for (const t of this.texts) {
      const color = t.opacity > 0.5 ? '#ff6b9d' : '#ffa07a'
      const size = Math.min(32, 20 * t.scale)
      if (this.onRender) {
        this.onRender(ctx, `${t.id}`, t)
      } else {
        this.render(ctx, `${t.id}`, t, color, size)
      }
    }
  }

  destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
    this.texts = []
    this.canvas = null
    this.ctx = null
  }
}

// Vue component wrapper
export const ComboTextComponent = defineComponent({
  props: {
    text: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    color: { type: String, default: '#ff6b9d' },
    size: { type: Number, default: 24 },
  },
  setup(props) {
    const el = ref<HTMLElement | null>(null)

    onMounted(() => {
      if (!el.value) return
      const style = el.value.style
      style.position = 'absolute'
      style.left = `${props.x}px`
      style.top = `${props.y}px`
      style.transform = 'translate(-50%, -50%)'
      style.color = props.color
      style.fontSize = `${props.size}px`
      style.fontWeight = 'bold'
      style.fontFamily = '"Nunito", sans-serif'
      style.pointerEvents = 'none'
      style.transition = 'all 0.5s ease-out'
      style.opacity = '1'
      style.textShadow = `0 0 10px ${props.color}`
    })

    // Animate out
    onMounted(() => {
      if (!el.value) return
      setTimeout(() => {
        const style = el.value!.style
        style.transform = `translate(-50%, calc(-50% - ${60 + Math.random() * 40}px))`
        style.opacity = '0'
      }, 50)
    })

    return () =>
      h('div', { ref: el, style: { position: 'absolute', pointerEvents: 'none' } }, props.text)
  },
})
