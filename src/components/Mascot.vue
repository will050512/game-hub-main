<script setup lang="ts">
import { computed } from 'vue'
import { mascotAssets } from '@/data/mascotManifest'

const props = defineProps<{
  mascot?: 'rabbit' | 'panda' | 'frog'
  expression?: 'idle' | 'happy' | 'surprised' | 'hurt' | 'win' | 'lose'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const currentMascot = computed(() => props.mascot || 'rabbit')
const currentExpression = computed(() => props.expression || 'idle')

const sizeClasses = {
  sm: 'mascot-sm',
  md: 'mascot-md',
  lg: 'mascot-lg',
}

const imageSrc = computed(() => {
  const assets = mascotAssets[currentMascot.value]
  if (!assets) return ''
  const expr = currentExpression.value
  return (assets as Record<string, string>)[expr] || assets.idle || ''
})

function handleClick() {
  emit('click')
}
</script>

<template>
  <button
    type="button"
    :class="['mascot-shell', sizeClasses[props.size || 'md'], { animated: props.animated }]"
    :aria-label="`${currentMascot} mascot - ${currentExpression}`"
    @click="handleClick"
  >
    <span class="mascot-glow"></span>
    <img
      :src="imageSrc"
      :alt="`${currentMascot} mascot - ${currentExpression}`"
      class="mascot-image"
    />
  </button>
</template>

<style scoped>
.mascot-shell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 180ms ease;
}

.mascot-shell:hover {
  transform: translateY(-4px) rotate(-2deg);
}

.mascot-shell:focus-visible {
  outline: 3px solid rgba(82, 180, 169, 0.88);
  outline-offset: 6px;
  border-radius: 28px;
}

.mascot-shell:active {
  transform: scale(0.97);
}

.mascot-shell.animated .mascot-image {
  animation: mascot-bob 1.8s ease-in-out infinite;
}

.mascot-glow {
  position: absolute;
  inset: 18% 16% 12%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(248, 207, 232, 0.58), rgba(255, 255, 255, 0));
  filter: blur(18px);
}

.mascot-image {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  filter: drop-shadow(0 10px 0 rgba(25, 18, 22, 0.1)) drop-shadow(0 16px 20px rgba(25, 18, 22, 0.18));
}

.mascot-sm {
  width: 68px;
  height: 68px;
}

.mascot-md {
  width: 112px;
  height: 112px;
}

.mascot-lg {
  width: 170px;
  height: 170px;
}

@keyframes mascot-bob {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mascot-shell.animated .mascot-image {
    animation: none;
  }

  .mascot-shell,
  .mascot-shell:hover,
  .mascot-shell:active {
    transform: none;
  }
}
</style>
