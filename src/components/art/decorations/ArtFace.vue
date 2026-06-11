<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 32"
    :height="size ?? 32"
    viewBox="0 0 32 32"
    fill="none"
    :style="{ color: color ?? '#fbbf24' }"
    aria-hidden="true"
  >
    <circle cx="16" cy="16" r="14" :fill="color ?? '#fbbf24'" stroke="#1e293b" stroke-width="1.5" />
    <circle cx="10" cy="13" r="2.5" fill="#1e293b" />
    <circle cx="22" cy="13" r="2.5" fill="#1e293b" />
    <circle cx="9" cy="12" r="0.8" fill="#ffffff" />
    <circle cx="21" cy="12" r="0.8" fill="#ffffff" />
    <ellipse cx="6" cy="19" rx="3" ry="2" fill="#f472b6" opacity="0.3" />
    <ellipse cx="26" cy="19" rx="3" ry="2" fill="#f472b6" opacity="0.3" />
    <path d="M12 21 Q16 24 20 21" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round" fill="none" />
  </svg>
</template>
