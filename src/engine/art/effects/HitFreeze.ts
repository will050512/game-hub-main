import { defineComponent, h, ref, onMounted, onUnmounted } from 'vue'

export interface HitFreezeOptions {
  duration?: number
  scale?: number
}

export class HitFreezeManager {
  private freezeTime = 0
  private active = false
  private onComplete?: () => void

  activate(duration = 100, onComplete?: () => void) {
    this.freezeTime = duration
    this.active = true
    this.onComplete = onComplete
    return duration
  }

  update(dt: number) {
    if (this.active && this.freezeTime > 0) {
      this.freezeTime -= dt
      if (this.freezeTime <= 0) {
        this.active = false
        this.onComplete?.()
      }
      return Math.max(0, this.freezeTime)
    }
    return 0
  }

  isActive() {
    return this.active
  }

  destroy() {
    this.active = false
    this.freezeTime = 0
  }
}

// Vue component wrapper
export const HitFreezeComponent = defineComponent({
  props: {
    duration: { type: Number, default: 100 },
    overlayColor: { type: String, default: 'rgba(255, 255, 255, 0.3)' },
  },
  setup(props) {
    const visible = ref(false)
    let timeout: ReturnType<typeof setTimeout> | null = null

    const trigger = () => {
      visible.value = true
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        visible.value = false
      }, props.duration)
    }

    onUnmounted(() => {
      if (timeout) clearTimeout(timeout)
    })

    return () =>
      h('div', {
        style: {
          position: 'fixed',
          inset: 0,
          backgroundColor: visible.value ? props.overlayColor : 'transparent',
          pointerEvents: 'none',
          transition: `all ${props.duration}ms ease-out`,
          opacity: visible.value ? 1 : 0,
          zIndex: 100,
        },
      })
  },
})
