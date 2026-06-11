<script setup lang="ts">
withDefaults(defineProps<{
  count?: number
  colorPalette?: string[]
}>(), {
  count: 5,
  colorPalette: () => [
    'var(--color-primary-alpha)',
    'var(--color-secondary-alpha)',
    'var(--color-accent-alpha)',
    'var(--color-kawaii-lilac-alt)',
    'var(--color-kawaii-sky-alt)',
  ],
})
</script>

<template>
  <div class="lobby-orbs" aria-hidden="true">
    <div
      v-for="i in count"
      :key="i"
      class="lobby-orb"
      :class="`lobby-orb-${i}`"
      :style="{ background: colorPalette[(i - 1) % colorPalette.length] }"
    />
  </div>
</template>

<style scoped>
.lobby-orbs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.lobby-orb {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
  will-change: transform;
}

/* Orb 1 - top-left, small */
.lobby-orb-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 8%;
  animation: orb-float-1 8s ease-in-out infinite;
}

/* Orb 2 - top-right, medium */
.lobby-orb-2 {
  width: 80px;
  height: 80px;
  top: 20%;
  right: 12%;
  animation: orb-float-2 10s ease-in-out infinite;
}

/* Orb 3 - center, large */
.lobby-orb-3 {
  width: 200px;
  height: 200px;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-float-3 12s ease-in-out infinite;
}

/* Orb 4 - bottom-left, medium */
.lobby-orb-4 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 10%;
  animation: orb-float-4 9s ease-in-out infinite;
}

/* Orb 5 - bottom-right, small */
.lobby-orb-5 {
  width: 60px;
  height: 60px;
  bottom: 15%;
  right: 8%;
  animation: orb-float-5 11s ease-in-out infinite;
}

@keyframes orb-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
  25% { transform: translate(30px, -20px) scale(1.1); opacity: 0.8; }
  50% { transform: translate(-10px, -40px) scale(0.95); opacity: 0.5; }
  75% { transform: translate(20px, 10px) scale(1.05); opacity: 0.7; }
}

@keyframes orb-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  33% { transform: translate(-25px, 15px) scale(1.08); opacity: 0.7; }
  66% { transform: translate(15px, -25px) scale(0.92); opacity: 0.4; }
}

@keyframes orb-float-3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  25% { transform: translate(calc(-50% + 40px), calc(-50% - 30px)) scale(1.12); opacity: 0.5; }
  50% { transform: translate(calc(-50% - 30px), calc(-50% + 20px)) scale(0.88); opacity: 0.2; }
  75% { transform: translate(calc(-50% + 15px), calc(-50% + 35px)) scale(1.06); opacity: 0.4; }
}

@keyframes orb-float-4 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  50% { transform: translate(35px, -15px) scale(1.08); opacity: 0.6; }
}

@keyframes orb-float-5 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  33% { transform: translate(-15px, -25px) scale(1.1); opacity: 0.6; }
  66% { transform: translate(20px, 10px) scale(0.9); opacity: 0.3; }
}
</style>
