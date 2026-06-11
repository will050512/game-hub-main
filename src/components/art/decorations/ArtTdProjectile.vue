<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 12"
    :height="size ?? 12"
    viewBox="0 0 12 12"
    fill="none"
    :style="{ color: color ?? '#60a5fa' }"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="tdProjGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#93c5fd" />
        <stop offset="100%" stop-color="#3b82f6" />
      </radialGradient>
      <filter id="tdProjGlow">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feFlood flood-color="#60a5fa" flood-opacity="0.4" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="6" cy="6" r="4" fill="url(#tdProjGrad)" filter="url(#tdProjGlow)" />
    <circle cx="5" cy="5" r="1" fill="#ffffff" opacity="0.7" />
  </svg>
</template>
