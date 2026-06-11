<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    :style="{ color: color ?? '#a855f7' }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="alienBulletGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c084fc" />
        <stop offset="100%" stop-color="#7e22ce" />
      </linearGradient>
      <filter id="alienBulletGlow">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feFlood flood-color="#a855f7" flood-opacity="0.4" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="8" cy="8" r="4" fill="url(#alienBulletGrad)" filter="url(#alienBulletGlow)" />
    <circle cx="8" cy="8" r="2" fill="#e9d5ff" />
  </svg>
</template>
