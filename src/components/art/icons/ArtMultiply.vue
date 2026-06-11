<!--
  ArtMultiply — Decorative X multiplication glyph with gradient.
  Korean mobile game aesthetic: clean gradient stroke, subtle glow.
-->
<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    :style="{ color: color ?? 'currentColor' }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="multiplyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#64748b" />
        <stop offset="50%" stop-color="#475569" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <filter id="multiplyGlow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
        <feFlood flood-color="#94a3b8" flood-opacity="0.25" result="glowColor" />
        <feMerge>
          <feMergeNode in="glowColor" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <path
      d="M4 4 L12 12 M12 4 L4 12"
      stroke="url(#multiplyGrad)"
      stroke-width="2.4"
      stroke-linecap="round"
      filter="url(#multiplyGlow)"
    />
  </svg>
</template>
