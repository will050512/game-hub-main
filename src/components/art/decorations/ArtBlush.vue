<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 48"
    :height="size ?? 24"
    viewBox="-24 -12 48 24"
    fill="none"
    :style="{ color: color ?? '#f472b6' }"
    aria-hidden="true"
  >
    <ellipse cx="-12" cy="0" rx="6" ry="3" fill="#f472b6" opacity="0.4" />
    <ellipse cx="12" cy="0" rx="6" ry="3" fill="#f472b6" opacity="0.4" />
  </svg>
</template>
