<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { KawaiiIconId } from '@/data/iconManifest'
import KawaiiIcon from '@/components/KawaiiIcon.vue'

export type ButtonPosition = 'bottom-right' | 'bottom-center' | 'right' | 'custom'

export interface VirtualButtonConfig {
  icon: KawaiiIconId | string
  action: string
  label?: string
  color?: string
}

const props = withDefaults(defineProps<{
  buttons: VirtualButtonConfig[]
  position?: ButtonPosition
  size?: number
  hapticEnabled?: boolean
}>(), {
  position: 'bottom-right',
  size: 72,
  hapticEnabled: true,
})

const emit = defineEmits<{
  press: [action: string]
  release: [action: string]
}>()

const pressedButtons = ref<Set<string>>(new Set())

const containerRef = ref<HTMLDivElement | null>(null)

const containerPosition = computed(() => {
  switch (props.position) {
    case 'bottom-center':
      return {
        bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'right':
      return {
        top: '50%',
        right: '16px',
        transform: 'translateY(-50%)',
        flexDirection: 'column' as const,
      }
    case 'custom':
      return {}
    default:
      return {
        bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        right: '24px',
      }
  }
})

const buttonSize = computed(() => {
  const base = props.size || 72
  return Math.min(base, Math.max(56, Math.round(window.innerWidth * 0.14)))
})

async function triggerHaptic() {
  if (!props.hapticEnabled) return
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) {
      const { Haptics } = await import('@capacitor/haptics')
      await Haptics.impact({ style: 'Medium' as any })
    }
  } catch {
    /* haptics not available in web */
  }
}

function handleTouchStart(e: TouchEvent, action: string) {
  e.preventDefault()
  pressedButtons.value = new Set(pressedButtons.value).add(action)
  emit('press', action)
  triggerHaptic()
}

function handleTouchEnd(e: TouchEvent, action: string) {
  e.preventDefault()
  const next = new Set(pressedButtons.value)
  next.delete(action)
  pressedButtons.value = next
  emit('release', action)
}

function handleTouchCancel(e: TouchEvent, action: string) {
  handleTouchEnd(e, action)
}
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-buttons"
    :style="containerPosition"
  >
    <div
      v-for="(btn, index) in buttons"
      :key="btn.action"
      class="virtual-button"
      :class="{ pressed: pressedButtons.has(btn.action) }"
      :style="{
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        background: btn.color
          ? btn.color + (pressedButtons.has(btn.action) ? 'dd' : '99')
          : undefined,
        order: index,
      }"
      @touchstart="(e: TouchEvent) => handleTouchStart(e, btn.action)"
      @touchend="(e: TouchEvent) => handleTouchEnd(e, btn.action)"
      @touchcancel="(e: TouchEvent) => handleTouchCancel(e, btn.action)"
    >
      <KawaiiIcon :name="(btn.icon as KawaiiIconId)" :size="buttonSize >= 72 ? 'lg' : 'md'" />
      <span v-if="btn.label" class="button-label">{{ btn.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.virtual-buttons {
  position: absolute;
  display: flex;
  gap: 12px;
  z-index: 10;
  touch-action: none;
}

.virtual-button {
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid var(--color-kawaii-ink, #261b22);
  background: linear-gradient(180deg, rgba(255, 250, 248, 0.58) 0%, rgba(252, 225, 242, 0.36) 100%);
  box-shadow:
    0 6px 14px rgba(38, 27, 34, 0.14),
    inset 0 0 0 2px rgba(255, 255, 255, 0.24);
  cursor: pointer;
  touch-action: none;
  transition:
    transform var(--duration-fast, 120ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
    background var(--duration-fast, 120ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
    box-shadow var(--duration-fast, 120ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
    opacity 150ms ease;
  opacity: 0;
  user-select: none;
  -webkit-user-select: none;
}

.virtual-button:active,
.virtual-button.pressed {
  transform: scale(0.88);
  opacity: 0.85;
  box-shadow:
    0 2px 6px rgba(38, 27, 34, 0.18),
    inset 0 2px 4px rgba(38, 27, 34, 0.12);
  background: linear-gradient(180deg, rgba(255, 250, 248, 0.9) 0%, rgba(252, 225, 242, 0.65) 100%);
}

.virtual-button.pressed {
  animation: button-press 0.15s ease-out;
}

.button-label {
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-size-xs, 0.5rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-kawaii-ink, #261b22);
  white-space: nowrap;
  opacity: 0.6;
}

@keyframes button-press {
  0% { transform: scale(1); }
  50% { transform: scale(0.85); }
  100% { transform: scale(0.88); }
}

@media (prefers-reduced-motion: reduce) {
  .virtual-button {
    transition: none !important;
  }
  .virtual-button.pressed {
    animation: none !important;
  }
}
</style>
