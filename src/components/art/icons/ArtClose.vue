<!--
  ArtClose — Soft X close icon with gradient stroke and glow.
  Korean mobile game aesthetic: warm gradient + subtle glow filter.
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
    :style="{ color: color ?? 'currentColor' }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="closeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f87171" />
        <stop offset="50%" stop-color="#ef4444" />
        <stop offset="100%" stop-color="#f97316" />
      </linearGradient>
      <linearGradient id="closeBgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff7ed" />
        <stop offset="100%" stop-color="#ffedd5" />
      </linearGradient>
      <filter id="closeGlow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
        <feFlood flood-color="#f87171" flood-opacity="0.35" result="glowColor" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.4 0 0 0.15  0 0 0 0 0  0 0 0 1 0" in="glowColor" result="warmGlow" />
        <feMerge>
          <feMergeNode in="warmGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <circle cx="12" cy="12" r="10" fill="url(#closeBgGrad)" stroke="#1a1a1a" stroke-width="1.6" />
    <path
      d="M8 8 L16 16 M16 8 L8 16"
      stroke="url(#closeGrad)"
      stroke-width="2.6"
      stroke-linecap="round"
      filter="url(#closeGlow)"
    />
  </svg>
</template>
