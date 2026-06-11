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
  background: var(--color-bg-elevated);
}

.kmg-skeleton::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-glass-bg-hover) 50%,
    transparent 100%
  );
  animation: kmg-pulse 1.5s ease-in-out infinite;
}

@keyframes kmg-pulse {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
