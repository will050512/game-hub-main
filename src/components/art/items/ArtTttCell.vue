<!--
  ArtTttCell — Gradient panel with subtle shadow and rounded corners.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 96"
    :height="size ?? 96"
    viewBox="0 0 96 96"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Cell gradient: light top to dark bottom -->
      <linearGradient id="tttCellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#f8fafc" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.7" />
      </linearGradient>
      <!-- Edge glow -->
      <filter id="tttCellGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feFlood flood-color="#94a3b8" flood-opacity="0.2" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <!-- Cell inner highlight -->
      <linearGradient id="tttCellShine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Drop shadow -->
    <rect x="5" y="6" width="86" height="86" rx="18" fill="#000000" opacity="0.08" />

    <!-- Glowing edge -->
    <rect x="3" y="3" width="90" height="90" rx="18" fill="url(#tttCellGrad)" stroke="#cbd5e1" stroke-width="2" filter="url(#tttCellGlow)" />

    <!-- Glass reflection overlay -->
    <rect x="5" y="5" width="86" height="38" rx="14" fill="url(#tttCellShine)" />

    <!-- Subtle top edge line -->
    <path d="M18 10 H78" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.35" />

    <!-- Bottom groove line -->
    <path d="M22 84 H74" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" opacity="0.12" />
  </svg>
</template>
