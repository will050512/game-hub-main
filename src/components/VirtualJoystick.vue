<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export type JoystickPosition = 'left' | 'right' | 'bottom-left' | 'bottom-right'
export type JoystickSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  position?: JoystickPosition
  size?: JoystickSize
  color?: string
  deadzone?: number
  maxDistance?: number
}>(), {
  position: 'left',
  size: 'md',
  color: '',
  deadzone: 10,
  maxDistance: 60,
})

const emit = defineEmits<{
  move: [moveX: number, moveY: number]
  start: []
  end: []
}>()

const joystickSizeMap: Record<JoystickSize, number> = { sm: 100, md: 128, lg: 160 }
const joystickBaseSize = computed(() => {
  const size = joystickSizeMap[props.size]
  if (size === undefined) return 128
  return size
})
const joystickThumbSize = computed(() => joystickBaseSize.value * 0.4)

const active = ref(false)
const thumbX = ref(0)
const thumbY = ref(0)
const originX = ref(0)
const originY = ref(0)

const containerRef = ref<HTMLDivElement | null>(null)
const touchId = ref<number | null>(null)

const thumbTransform = computed(() => `translate(${thumbX.value}px, ${thumbY.value}px)`)

const baseStyle = computed(() => {
  const base = joystickBaseSize.value
  const responsiveSize = Math.min(base, Math.max(96, Math.round(window.innerWidth * 0.25)))
  return {
    width: `${responsiveSize}px`,
    height: `${responsiveSize}px`,
  }
})

const thumbStyle = computed(() => {
  const size = joystickThumbSize.value
  const customColor = props.color
  const mainColor = customColor || 'var(--color-kawaii-warm-main, #f6b7d2)'
  const altColor = customColor
    ? customColor + 'cc'
    : 'var(--color-kawaii-warm-alt, #fce7f3)'

  return {
    width: `${size}px`,
    height: `${size}px`,
    background: `linear-gradient(180deg, ${mainColor}, ${altColor})`,
    transform: thumbTransform.value,
    transition: active.value ? 'none' : 'transform 0.2s var(--ease-out, cubic-bezier(0, 0, 0.2, 1))',
  }
})

const containerPosition = computed(() => {
  const safeBottom = `max(8px, env(safe-area-inset-bottom, 8px))`
  const safeLeft = `max(8px, env(safe-area-inset-left, 8px))`
  const safeRight = `max(8px, env(safe-area-inset-right, 8px))`

  switch (props.position) {
    case 'right':
      return { bottom: safeBottom, right: safeRight, left: 'auto' }
    case 'bottom-left':
      return { bottom: safeBottom, left: safeLeft }
    case 'bottom-right':
      return { bottom: safeBottom, right: safeRight }
    default:
      return { bottom: safeBottom, left: safeLeft }
  }
})

function handleStart(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  e.preventDefault()

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return

  touchId.value = touch.identifier
  originX.value = touch.clientX - rect.left
  originY.value = touch.clientY - rect.top

  const cx = rect.width / 2
  const cy = rect.height / 2
  originX.value = cx
  originY.value = cy

  active.value = true
  emit('start')
}

function handleMove(e: TouchEvent) {
  if (!active.value || touchId.value === null) return
  e.preventDefault()

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return

  let currentTouch: Touch | undefined
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches.item(i)
    if (touch?.identifier === touchId.value) {
      currentTouch = touch
      break
    }
  }
  if (!currentTouch) return

  const dx = currentTouch.clientX - (rect.left + originX.value)
  const dy = currentTouch.clientY - (rect.top + originY.value)
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist < props.deadzone) {
    thumbX.value = 0
    thumbY.value = 0
    emit('move', 0, 0)
    return
  }

  const maxDist = Math.min(dist, props.maxDistance)
  const ratio = maxDist / props.maxDistance
  const angle = Math.atan2(dy, dx)

  thumbX.value = Math.cos(angle) * maxDist
  thumbY.value = Math.sin(angle) * maxDist

  emit('move', (dx / dist) * ratio, (dy / dist) * ratio)
}

function handleEnd(e: TouchEvent) {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches.item(i)
    if (touch?.identifier === touchId.value) {
      active.value = false
      touchId.value = null
      thumbX.value = 0
      thumbY.value = 0
      emit('move', 0, 0)
      emit('end')
      break
    }
  }
}

onMounted(() => {
  const el = containerRef.value
  if (!el) return
  el.addEventListener('touchstart', handleStart, { passive: false })
  el.addEventListener('touchmove', handleMove, { passive: false })
  el.addEventListener('touchend', handleEnd, { passive: false })
  el.addEventListener('touchcancel', handleEnd, { passive: false })
})

onUnmounted(() => {
  const el = containerRef.value
  if (!el) return
  el.removeEventListener('touchstart', handleStart)
  el.removeEventListener('touchmove', handleMove)
  el.removeEventListener('touchend', handleEnd)
  el.removeEventListener('touchcancel', handleEnd)
})
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-joystick"
    :style="{
      ...containerPosition,
    }"
    :class="{ active }"
  >
    <div class="joystick-base" :style="baseStyle">
      <div class="joystick-ring"></div>
      <div v-if="active" class="joystick-line" :style="{
        transform: `rotate(${Math.atan2(thumbY, thumbX)}rad)`,
        width: `${Math.min(Math.sqrt(thumbX * thumbX + thumbY * thumbY), maxDistance)}px`,
      }"></div>
      <div class="joystick-thumb" :style="thumbStyle"></div>
    </div>
  </div>
</template>

<style scoped>
.virtual-joystick {
  position: absolute;
  z-index: 10;
  touch-action: none;
  opacity: 0;
  transition: opacity 150ms ease;
}

.virtual-joystick.active {
  opacity: 0.85;
}

.joystick-base {
  position: relative;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(247, 231, 255, 0.36) 0%, rgba(230, 255, 248, 0.12) 70%);
  border: 2px solid var(--color-kawaii-ink, #261b22);
  box-shadow:
    0 8px 16px rgba(38, 27, 34, 0.12),
    inset 0 0 0 3px rgba(255, 255, 255, 0.18);
  overflow: visible;
}

.joystick-ring {
  position: absolute;
  inset: 20%;
  border-radius: 50%;
  border: 1.5px dashed rgba(38, 27, 34, 0.14);
  pointer-events: none;
}

.joystick-line {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 2px;
  background: linear-gradient(90deg, var(--color-kawaii-ink, #261b22), transparent);
  transform-origin: left center;
  pointer-events: none;
  opacity: 0.25;
}

.joystick-thumb {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 2px solid var(--color-kawaii-ink, #261b22);
  box-shadow: 0 4px 8px rgba(38, 27, 34, 0.18);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .virtual-joystick {
    transition: none;
  }
}
</style>
