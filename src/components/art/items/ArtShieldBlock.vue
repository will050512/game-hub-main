<!--
  ArtShieldBlock — Tintable top-left pivot shield block.
-->
<script setup lang="ts">
defineProps<{ size?: number; bodyColor?: string }>()
</script>

<template>
  <svg
    :width="size ?? 24"
    :height="size ?? 24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="1" y="1" width="22" height="22" rx="4" :fill="bodyColor ?? '#84cc16'" stroke="#1a1a1a" stroke-width="1.6" />
    <path d="M12 5 L18 7.5 V12.5 Q18 17.5 12 20 Q6 17.5 6 12.5 V7.5 Z" fill="#ffffff" opacity="0.35" stroke="#1a1a1a" stroke-width="1.1" stroke-linejoin="round" />
    <path d="M7 5 H17" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity="0.65" />
  </svg>
</template>
