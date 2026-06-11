<!--
  ArtTttX — Gradient stroke X mark with cyan→blue glow effect.
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
      <!-- Cyan to blue gradient for stroke -->
      <linearGradient id="tttXGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22d3ee" />
        <stop offset="100%" stop-color="#3b82f6" />
      </linearGradient>
      <!-- Glow filter -->
      <filter id="tttXGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood flood-color="#3b82f6" flood-opacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Outer glow layer -->
    <path d="M18 16 L48 46 M46 16 L16 46" :stroke="inkColor ?? '#3b82f6'" stroke-width="12" stroke-linecap="round" opacity="0.25" filter="url(#tttXGlow)" />

    <!-- Mid glow layer -->
    <path d="M18 16 L48 46 M46 16 L16 46" :stroke="inkColor ?? '#3b82f6'" stroke-width="9" stroke-linecap="round" opacity="0.4" filter="url(#tttXGlow)" />

    <!-- Main stroke with gradient -->
    <path d="M18 16 L48 46 M46 16 L16 46" stroke="url(#tttXGrad)" stroke-width="7" stroke-linecap="round" />

    <!-- Glossy highlight -->
    <path d="M20 15 L30 25 M46 16 L36 26" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6" />

    <!-- Bright edge highlight -->
    <path d="M19 17 L47 45" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.3" />
  </svg>
</template>
