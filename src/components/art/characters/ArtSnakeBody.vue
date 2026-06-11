<!--
  ArtSnakeBody — Single body segment. Tileable along snake path.
  Korean mobile game aesthetic: 3D radial gradient, glossy highlights, gradient fill.
  Slight scale variation between segments handled by drawSprite scale prop.
-->
<script setup lang="ts">
defineProps<{ size?: number; bodyColor?: string }>()
</script>

<template>
  <svg
    :width="size ?? 32"
    :height="size ?? 32"
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- 3D radial gradient for sphere-like depth -->
      <radialGradient id="bodyGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#86efac" />
        <stop offset="25%" stop-color="#4ade80" />
        <stop offset="55%" stop-color="#22c55e" />
        <stop offset="80%" stop-color="#16a34a" />
        <stop offset="100%" stop-color="#15803d" />
      </radialGradient>

      <!-- Belly gradient (lighter, softer) -->
      <radialGradient id="bodyBellyGrad" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#dcfce7" />
        <stop offset="100%" stop-color="#bbf7d0" />
      </radialGradient>

      <!-- Scale pattern -->
      <pattern id="bodyScales" x="0" y="0" width="2.5" height="2.5" patternUnits="userSpaceOnUse">
        <circle cx="1.25" cy="1.25" r="1" fill="#ffffff" opacity="0.05" />
      </pattern>

      <!-- Glossy highlight gradient -->
      <linearGradient id="bodyGloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Drop shadow -->
      <filter id="bodyShadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.2" />
      </filter>
    </defs>

    <!-- Outer round segment with 3D gradient -->
    <circle cx="16" cy="16" r="12" fill="url(#bodyGrad)" stroke="#1a1a1a" stroke-width="1.6" filter="url(#bodyShadow)" />

    <!-- Scales overlay -->
    <circle cx="16" cy="16" r="12" fill="url(#bodyScales)" stroke="none" />

    <!-- Belly tone -->
    <ellipse cx="16" cy="19" rx="8" ry="3.2" fill="url(#bodyBellyGrad)" opacity="0.85" />

    <!-- Glossy highlight arc on top-left -->
    <path d="M10 11.5 Q16 7 21 11" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.55" />
    <path d="M12 13.5 Q16 10.5 20 13.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.3" />

    <!-- Subtle scale dot (kept from original) -->
    <circle cx="20" cy="14" r="1" fill="#1a1a1a" opacity="0.15" />

    <!-- Thin inner rim highlight -->
    <circle cx="16" cy="16" r="11" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.15" />
  </svg>
</template>
