<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    :style="{ color: color ?? '#4ade80' }"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="projGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#86efac" />
        <stop offset="100%" stop-color="#22c55e" />
      </radialGradient>
      <filter id="projGlow">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feFlood flood-color="#4ade80" flood-opacity="0.5" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="8" cy="8" r="5" fill="url(#projGrad)" filter="url(#projGlow)" />
    <circle cx="6" cy="6" r="1.5" fill="#ffffff" opacity="0.8" />
  </svg>
</template>
