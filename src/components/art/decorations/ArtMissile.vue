<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 24"
    viewBox="0 0 16 24"
    fill="none"
    :style="{ color: color ?? '#f43f5e' }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="missileGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f87171" />
        <stop offset="100%" stop-color="#be123c" />
      </linearGradient>
      <filter id="missileGlow">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feFlood flood-color="#f43f5e" flood-opacity="0.4" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path d="M8 2 Q12 8 12 14 Q12 18 8 18 Q4 18 4 14 Q4 8 8 2Z" fill="url(#missileGrad)" filter="url(#missileGlow)" stroke="#1e293b" stroke-width="1" />
    <circle cx="8" cy="10" r="2" fill="#fecdd3" />
  </svg>
</template>
