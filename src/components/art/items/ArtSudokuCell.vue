<!--
  ArtSudokuCell — Gradient panel with subtle border glow, tintable body.
-->
<script setup lang="ts">
defineProps<{ size?: number; bodyColor?: string }>()
</script>

<template>
  <svg
    :width="size ?? 56"
    :height="size ?? 56"
    viewBox="0 0 56 56"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Body color tint gradient -->
      <linearGradient id="sudokuGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="bodyColor ?? '#ffffff'" stop-opacity="0.95" />
        <stop offset="100%" :stop-color="bodyColor ?? '#e2e8f0'" stop-opacity="0.7" />
      </linearGradient>
      <!-- Border glow -->
      <filter id="sudokuGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feFlood :flood-color="bodyColor ?? '#8b5cf6'" flood-opacity="0.3" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <!-- Inner highlight -->
      <linearGradient id="sudokuHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Glowing border behind -->
    <rect x="2" y="2" width="52" height="52" rx="9" fill="none" :stroke="bodyColor ?? '#8b5cf6'" stroke-width="3" opacity="0.25" filter="url(#sudokuGlow)" />

    <!-- Main cell -->
    <rect x="2" y="2" width="52" height="52" rx="9" fill="url(#sudokuGrad)" :stroke="bodyColor ?? '#6d28d9'" stroke-width="1.5" stroke-opacity="0.5" />

    <!-- Glass top highlight -->
    <rect x="3" y="3" width="50" height="22" rx="7" fill="url(#sudokuHighlight)" />

    <!-- Subtle grid lines -->
    <path d="M18 4 V52 M38 4 V52 M4 18 H52 M4 38 H52" stroke="#ffffff" stroke-width="0.5" opacity="0.12" />

    <!-- Top shine line -->
    <path d="M10 6 H46" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />
  </svg>
</template>
