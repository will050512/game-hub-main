<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    :style="{ color: color ?? '#22d3ee' }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="playerBulletGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#67e8f9" />
        <stop offset="100%" stop-color="#0891b2" />
      </linearGradient>
      <filter id="playerBulletGlow">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feFlood flood-color="#22d3ee" flood-opacity="0.5" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect x="6" y="1" width="4" height="14" rx="2" fill="url(#playerBulletGrad)" filter="url(#playerBulletGlow)" />
  </svg>
</template>
