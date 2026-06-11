/**
 * ScreenShake — Screen shake effect triggered by major events.
 * Used by: survivor, breakout, tetris, snake, invaders, fruit-catch
 */

export interface ShakeEvent {
  intensity: number
  decay: number
  duration: number
  elapsed: number
}

export class ScreenShakeManager {
  private events: ShakeEvent[] = []
  private offsetX = 0
  private offsetY = 0
  private canvas: HTMLCanvasElement | null = null
  private onShakeChange?: (offsetX: number, offsetY: number) => void

  initialize(canvas: HTMLCanvasElement, onChange?: (offsetX: number, offsetY: number) => void) {
    this.canvas = canvas
    this.onShakeChange = onChange
  }

  shake(intensity: number, duration = 300) {
    const event: ShakeEvent = {
      intensity,
      decay: intensity * 0.95,
      duration,
      elapsed: 0,
    }
    this.events.push(event)

    setTimeout(() => {
      const idx = this.events.indexOf(event)
      if (idx !== -1) this.events.splice(idx, 1)
    }, duration)
  }

  update(dt: number) {
    this.offsetX = 0
    this.offsetY = 0

    let totalIntensity = 0
    for (const event of this.events) {
      event.elapsed += dt
      const progress = event.elapsed / event.duration
      const currentIntensity = event.intensity * (1 - progress)

      if (currentIntensity > 0) {
        this.offsetX += (Math.random() - 0.5) * currentIntensity
        this.offsetY += (Math.random() - 0.5) * currentIntensity
        totalIntensity = Math.max(totalIntensity, currentIntensity)
      }
    }

    this.onShakeChange?.(this.offsetX, this.offsetY)
  }

  renderFrame() {
    // Handled by onShakeChange callback
  }

  destroy() {
    this.events = []
    this.offsetX = 0
    this.offsetY = 0
    this.canvas = null
  }
}

import { defineComponent, h, ref, onMounted } from 'vue'

// Vue component wrapper
export const ScreenShakeComponent = defineComponent({
  props: {
    intensity: { type: Number, default: 10 },
    duration: { type: Number, default: 300 },
  },
  setup(props: { intensity: number; duration: number }) {
    const el = ref<HTMLElement | null>(null)

    onMounted(() => {
      if (!el.value) return
      const animation = el.value.animate(
        [
          { transform: 'translate(0, 0)' },
          { transform: 'translate(-8px, -4px)' },
          { transform: 'translate(6px, 8px)' },
          { transform: 'translate(-4px, -6px)' },
          { transform: 'translate(2px, 3px)' },
          { transform: 'translate(0, 0)' },
        ],
        {
          duration: props.duration,
          easing: 'ease-out',
          fill: 'forwards',
        }
      )

      animation.onfinish = () => {
        el.value!.style.transform = 'translate(0, 0)'
      }
    })

    return () =>
      h('div', { ref: el, style: { transition: 'transform 0.3s ease-out' } }, [])
  },
})
