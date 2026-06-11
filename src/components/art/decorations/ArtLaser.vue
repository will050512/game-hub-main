<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 8"
    :height="size ?? 16"
    viewBox="0 0 8 16"
    fill="none"
    :style="{ color: color ?? '#f97316' }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="laserGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fb923c" />
        <stop offset="50%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#ea580c" />
      </linearGradient>
      <filter id="laserGlow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feFlood flood-color="#f97316" flood-opacity="0.6" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect x="3" y="1" width="2" height="14" rx="1" fill="url(#laserGrad)" filter="url(#laserGlow)" />
  </svg>
</template>
