<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  duration?: number
  confetti?: boolean
}>(), {
  duration: 800,
  confetti: true,
})

const isExiting = ref(false)
const isConfetti = ref(props.confetti)

function confettiStyle(n: number): Record<string, string> {
  const colors = ['#f6b7d2', '#92d5aa', '#a6d9f7', '#c7b6f5', '#f4d47a', '#f6c4a2', '#f59e0b', '#ef4444']
  const x = Math.random() * 100
  const y = Math.random() * 100
  const rotation = Math.random() * 360
  const color = colors[Math.floor(Math.random() * colors.length)] ?? '#f6b7d2'
  return {
    left: `${x}%`,
    top: `${y}%`,
    backgroundColor: color,
    transform: `rotate(${rotation}deg)`,
  }
}

function triggerExit() {
  isExiting.value = true
  setTimeout(() => {
    isConfetti.value = false
  }, props.duration)
}

function reset() {
  isExiting.value = false
  isConfetti.value = props.confetti
}

defineExpose({ triggerExit, reset })
</script>

<template>
  <div class="game-transition-wrapper">
    <!-- Confetti layer -->
    <Teleport v-if="isConfetti && isExiting" to="body">
      <div class="confetti-layer">
        <div v-for="n in 30" :key="n" class="confetti-piece" :style="confettiStyle(n) as any" />
      </div>
    </Teleport>

    <Transition
      name="game-fade"
      mode="out-in"
      @before-leave="isExiting = true"
    >
      <slot v-if="!isExiting" />
    </Transition>
  </div>
</template>

<style scoped>
.game-transition-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.confetti-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  opacity: 0.9;
  animation: confetti-fall 1.2s ease-out forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-20px) rotate(0deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg) scale(0.3);
    opacity: 0;
  }
}

.game-fade-enter-active,
.game-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.game-fade-enter-from,
.game-fade-leave-to {
  opacity: 0;
}
</style>
