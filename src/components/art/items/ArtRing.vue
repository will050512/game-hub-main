<!--
  ArtRing — Metallic 3D torus ring with bevel and glow.
  Korean mobile game aesthetic: golden metallic gradient, top highlight,
  bottom shadow, inner rim specular, outer glow aura.
-->
<script setup lang="ts">
defineProps<{ size?: number; inkColor?: string }>()
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
      <!-- Outer glow filter -->
      <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 1 0
        " />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Gold / metallic gradient (default for gold inkColor) -->
      <linearGradient id="ringMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7" />
        <stop offset="15%" stop-color="#f59e0b" />
        <stop offset="45%" stop-color="#d97706" />
        <stop offset="75%" stop-color="#b45309" />
        <stop offset="100%" stop-color="#92400e" />
      </linearGradient>

      <!-- Top highlight arc gradient -->
      <linearGradient id="ringHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="40%" stop-color="#fef3c7" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
      </linearGradient>

      <!-- Bottom shadow arc gradient -->
      <linearGradient id="ringShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#92400e" stop-opacity="0" />
        <stop offset="50%" stop-color="#78350f" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#451a03" stop-opacity="0.9" />
      </linearGradient>

      <!-- Inner rim specular -->
      <radialGradient id="ringInnerGlow" cx="50%" cy="30%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="30%" stop-color="#fef3c7" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
      </radialGradient>

      <!-- Center fill gradient -->
      <radialGradient id="ringCenter" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef9c3" stop-opacity="0.15" />
        <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#1a1a2e" stop-opacity="0.9" />
      </radialGradient>

      <!-- Dynamic gradient that adapts to inkColor -->
      <linearGradient id="dynamicMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="white" stop-opacity="0.6" />
        <stop offset="20%" stop-color="currentColor" />
        <stop offset="50%" stop-color="currentColor" />
        <stop offset="80%" stop-color="currentColor" />
        <stop offset="100%" stop-color="black" stop-opacity="0.5" />
      </linearGradient>
    </defs>

    <!-- Outer glow aura -->
    <circle cx="40" cy="40" r="34" fill="#fbbf24" opacity="0.12" filter="url(#ringGlow)">
      <animate attributeName="opacity" values="0.08;0.2;0.08" dur="3s" repeatCount="indefinite" />
    </circle>

    <!-- Outer ring shadow -->
    <circle cx="40" cy="41" r="31" :fill="inkColor ?? '#d97706'" opacity="0.3" />

    <!-- Main ring body with metallic gradient -->
    <circle cx="40" cy="40" r="31" :stroke="inkColor ?? '#f59e0b'" stroke-width="10" opacity="0.9" />

    <!-- Ring base (darker, bottom half) -->
    <path d="M9 40 A31 31 0 0 0 71 40" stroke="#78350f" stroke-width="10" stroke-linecap="round" opacity="0.3" />

    <!-- Ring body with 3D shading overlay -->
    <circle cx="40" cy="40" r="26" stroke="url(#ringMetal)" stroke-width="10" fill="none" />

    <!-- Top highlight arc (creates 3D bevel effect) -->
    <path d="M9 40 A31 31 0 0 1 71 40" stroke="url(#ringHighlight)" stroke-width="10" stroke-linecap="round" opacity="0.7" />

    <!-- Bottom shadow arc -->
    <path d="M9 40 A31 31 0 0 0 71 40" stroke="url(#ringShadow)" stroke-width="10" stroke-linecap="round" opacity="0.6" />

    <!-- Inner ring surface -->
    <circle cx="40" cy="40" r="21" stroke="url(#ringMetal)" stroke-width="6" fill="none" opacity="0.85" />

    <!-- Inner rim specular highlight (top portion) -->
    <path d="M19 40 A21 21 0 0 1 61 40" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.5" />

    <!-- Inner dark fill -->
    <circle cx="40" cy="40" r="18.5" fill="url(#ringCenter)" stroke="#1a1a2e" stroke-width="2" />

    <!-- Decorative inner pattern - rune marks -->
    <circle cx="40" cy="22" r="1.5" fill="#fef3c7" opacity="0.6" />
    <circle cx="40" cy="58" r="1.5" fill="#f59e0b" opacity="0.4" />
    <circle cx="22" cy="40" r="1.2" fill="#fbbf24" opacity="0.5" />
    <circle cx="58" cy="40" r="1.2" fill="#fbbf24" opacity="0.5" />

    <!-- Center glow -->
    <circle cx="40" cy="40" r="12" fill="#fbbf24" opacity="0.08" filter="url(#ringGlow)" />

    <!-- Sparkle top-right -->
    <path d="M58 20 L59 23 L62 24 L59 25 L58 28 L57 25 L54 24 L57 23 Z" fill="#fef3c7" opacity="0.7">
      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />
    </path>

    <!-- Sparkle bottom-left -->
    <path d="M24 60 L24.5 61.5 L26 62 L24.5 62.5 L24 64 L23.5 62.5 L22 62 L23.5 61.5 Z" fill="#fef9c3" opacity="0.5">
      <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.5s" repeatCount="indefinite" />
    </path>
  </svg>
</template>
