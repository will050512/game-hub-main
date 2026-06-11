<!--
  ArtCardFace — Warm frosted card face with gradient overlay.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 80"
    :height="size ?? 80"
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Card border gradient: warm gold -->
      <linearGradient id="cardFaceBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="50%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
      <!-- Face cream gradient -->
      <linearGradient id="cardFaceFill" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fffbeb" />
        <stop offset="40%" stop-color="#fefce8" />
        <stop offset="100%" stop-color="#fef3c7" />
      </linearGradient>
      <!-- Glass reflection -->
      <linearGradient id="cardGlass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03" />
      </linearGradient>
      <!-- Subtle drop shadow -->
      <filter id="cardFaceShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.1" />
      </filter>
    </defs>

    <!-- Shadow -->
    <rect x="4" y="5" width="72" height="72" rx="12" fill="#000000" opacity="0.1" />

    <!-- Outer warm border -->
    <rect x="3" y="3" width="74" height="74" rx="12" fill="url(#cardFaceBorder)" stroke="#78350f" stroke-width="2" filter="url(#cardFaceShadow)" />

    <!-- Cream face -->
    <rect x="7" y="7" width="66" height="66" rx="9" fill="url(#cardFaceFill)" stroke="#fde68a" stroke-width="1" />

    <!-- Frosted glass overlay -->
    <rect x="7" y="7" width="66" height="66" rx="9" fill="url(#cardGlass)" />

    <!-- Corner micro-ornaments -->
    <g opacity="0.4">
      <path d="M12 12 L18 12 M12 12 L12 18" stroke="#f59e0b" stroke-width="1" stroke-linecap="round" />
      <path d="M68 12 L62 12 M68 12 L68 18" stroke="#f59e0b" stroke-width="1" stroke-linecap="round" />
      <path d="M12 68 L18 68 M12 68 L12 62" stroke="#f59e0b" stroke-width="1" stroke-linecap="round" />
      <path d="M68 68 L62 68 M68 68 L68 62" stroke="#f59e0b" stroke-width="1" stroke-linecap="round" />
    </g>

    <!-- Subtle top highlight -->
    <rect x="11" y="11" width="58" height="22" rx="8" fill="#ffffff" opacity="0.08" />

    <!-- Center placeholder line (for number/text) -->
    <path d="M28 40 H52" stroke="#d4d4d4" stroke-width="1.5" stroke-linecap="round" opacity="0.35" />

    <!-- Bottom decorative dots -->
    <g opacity="0.3">
      <circle cx="25" cy="62" r="1.5" fill="#fbbf24" />
      <circle cx="40" cy="62" r="1.5" fill="#fbbf24" />
      <circle cx="55" cy="62" r="1.5" fill="#fbbf24" />
    </g>

    <!-- Subtle inner glow line at top -->
    <path d="M15 9 H65" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.2" />
  </svg>
</template>
