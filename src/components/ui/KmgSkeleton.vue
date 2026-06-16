<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'rect' | 'circle' | 'text' | 'image'
  width?: string | number
  height?: string | number
}>(), {
  variant: 'rect',
  width: '100%',
  height: '24px',
})

const resolvedWidth = computed(() => props.width ?? '100%')
const resolvedHeight = computed(() => props.height ?? '24px')

const baseStyles = computed(() => ({
  width: resolvedWidth.value,
  height: resolvedHeight.value,
}))

const variantStyles = computed(() => {
  switch (props.variant) {
    case 'circle':
      return { borderRadius: '50%', width: resolvedHeight.value, height: resolvedHeight.value }
    case 'text':
      return { borderRadius: 'var(--radius-sm)', width: '80px', height: '14px' }
    case 'image':
      return { borderRadius: 'var(--radius-lg)' }
    case 'rect':
    default:
      return { borderRadius: 'var(--radius-base)' }
  }
})
</script>

<template>
  <div
    class="kmg-skeleton"
    :class="[`kmg-skeleton--${variant}`]"
    :style="{ ...baseStyles, ...variantStyles }"
    aria-busy="true"
    role="status"
  />
</template>

<style scoped>
.kmg-skeleton {
  position: relative;
  overflow: hidden;
  background: var(--color-border-light);
  border-radius: var(--radius-lg);
}

.kmg-skeleton::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  animation: kmg-pulse var(--duration-slow) var(--ease-spring) infinite;
}

@keyframes kmg-pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
