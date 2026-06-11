<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 24"
    :height="size ?? 24"
    viewBox="0 0 24 24"
    fill="none"
    :style="{ color: color ?? '#1e293b' }"
    aria-hidden="true"
  >
    <ellipse cx="12" cy="12" rx="10" ry="11" :fill="color ?? '#ffffff'" stroke="#1e293b" stroke-width="1.5" />
    <circle cx="12" cy="12" r="5" fill="#1e293b" />
    <circle cx="10" cy="9" r="2" fill="#ffffff" />
    <circle cx="14" cy="14" r="0.8" fill="#ffffff" />
  </svg>
</template>
