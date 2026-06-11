<!--
  ArtCheck — Chibi check mark with gradient stroke and glow.
  Korean mobile game aesthetic: vibrant gradient + subtle glow filter.
-->
<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
</script>

<template>
  <svg
    :width="size ?? 24"
    :height="size ?? 24"
    viewBox="0 0 24 24"
    fill="none"
    :style="{ color: color ?? '#10b981' }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="checkGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#34d399" />
        <stop offset="50%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#047857" />
      </linearGradient>
      <linearGradient id="checkBgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ecfdf5" />
        <stop offset="100%" stop-color="#d1fae5" />
      </linearGradient>
      <filter id="checkGlow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
        <feFlood flood-color="#34d399" flood-opacity="0.4" result="glowColor" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.8  0 0 0 0 0.5  0 0 0 1 0" in="glowColor" result="greenGlow" />
        <feMerge>
          <feMergeNode in="greenGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <circle cx="12" cy="12" r="10" fill="url(#checkBgGrad)" stroke="#1a1a1a" stroke-width="1.6" />
    <path
      d="M7 12.5 L10.5 16 L17 9"
      stroke="url(#checkGrad)"
      stroke-width="2.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      filter="url(#checkGlow)"
    />
  </svg>
</template>
