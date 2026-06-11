<!--
  ArtTttO — Gradient stroke glowing O/circle with magenta→pink effect.
-->
<script setup lang="ts">
defineProps<{ size?: number; inkColor?: string }>()
</script>

<template>
  <svg
    :width="size ?? 64"
    :height="size ?? 64"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Magenta to pink gradient for stroke -->
      <linearGradient id="tttOGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d946ef" />
        <stop offset="100%" stop-color="#ec4899" />
      </linearGradient>
      <!-- Glow filter -->
      <filter id="tttOGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood flood-color="#ec4899" flood-opacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Outer glow layer -->
    <circle cx="32" cy="32" r="20" fill="none" :stroke="inkColor ?? '#ec4899'" stroke-width="11" opacity="0.25" filter="url(#tttOGlow)" />

    <!-- Mid glow layer -->
    <circle cx="32" cy="32" r="20" fill="none" :stroke="inkColor ?? '#ec4899'" stroke-width="8" opacity="0.4" filter="url(#tttOGlow)" />

    <!-- Main gradient stroke -->
    <circle cx="32" cy="32" r="20" fill="none" stroke="url(#tttOGrad)" stroke-width="7" />

    <!-- Glossy highlight arc -->
    <path d="M22 22 Q30 15 38 20" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.55" fill="none" />

    <!-- Bright edge highlight -->
    <circle cx="32" cy="32" r="20" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.2" />
  </svg>
</template>
