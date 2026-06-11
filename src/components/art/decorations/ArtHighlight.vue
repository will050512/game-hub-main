<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 24"
    :height="size ?? 8"
    viewBox="0 0 24 8"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="highlightGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="24" height="8" rx="4" fill="url(#highlightGrad)" />
  </svg>
</template>
