<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 40"
    :height="size ?? 32"
    viewBox="0 0 40 32"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Body gradient: purple → magenta bioluminescent -->
      <linearGradient id="squidBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c084fc" />
        <stop offset="40%" stop-color="#a855f7" />
        <stop offset="100%" stop-color="#ec4899" />
      </linearGradient>
      <!-- Body sheen (top-left highlight) -->
      <linearGradient id="squidSheen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <!-- Tentacle gradient -->
      <linearGradient id="tentacleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#d946ef" />
        <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.3" />
      </linearGradient>
      <!-- Glowing eye filter -->
      <filter id="squidEyeGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <!-- Body glow filter -->
      <filter id="squidGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <!-- Shadow -->
      <filter id="squidShadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#581c87" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Body glow backdrop -->
    <path d="M10 13 Q20 0 30 13 L28 23 Q20 30 12 23 Z" fill="#7c3aed" opacity="0.25" filter="url(#squidGlow)" />

    <!-- Main body with gradient and shadow -->
    <path d="M10 13 Q20 2 30 13 L28 23 Q20 29 12 23 Z" fill="url(#squidBody)" stroke="#4c1d95" stroke-width="1.4" stroke-linejoin="round" filter="url(#squidShadow)" />

    <!-- Glossy top-left sheen -->
    <path d="M11 12 Q20 3 29 12 L27 16 Q20 12 13 16 Z" fill="url(#squidSheen)" />

    <!-- Body segment lines for 3D shading -->
    <path d="M14 18 Q20 15 26 18" stroke="#86198f" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.5" />
    <path d="M13 21 Q20 18 27 21" stroke="#86198f" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.4" />

    <!-- Eyes - bright cyan glow -->
    <circle cx="16" cy="17" r="3" fill="#042f2e" stroke="#22d3ee" stroke-width="1" filter="url(#squidEyeGlow)" />
    <circle cx="24" cy="17" r="3" fill="#042f2e" stroke="#22d3ee" stroke-width="1" filter="url(#squidEyeGlow)" />
    <circle cx="17" cy="16" r="1" fill="#ffffff" />
    <circle cx="25" cy="16" r="1" fill="#ffffff" />

    <!-- Tentacles with gradient -->
    <path d="M12 23 Q8 26 6 30" stroke="url(#tentacleGrad)" stroke-width="1.6" stroke-linecap="round" />
    <path d="M17 25 Q15 28 14 31" stroke="url(#tentacleGrad)" stroke-width="1.4" stroke-linecap="round" />
    <path d="M23 25 Q25 28 26 31" stroke="url(#tentacleGrad)" stroke-width="1.4" stroke-linecap="round" />
    <path d="M28 23 Q32 26 34 30" stroke="url(#tentacleGrad)" stroke-width="1.6" stroke-linecap="round" />

    <!-- Bioluminescent spots on body -->
    <circle cx="14" cy="20" r="0.7" fill="#e879f9" opacity="0.5" />
    <circle cx="20" cy="22" r="0.8" fill="#e879f9" opacity="0.4" />
    <circle cx="26" cy="20" r="0.7" fill="#e879f9" opacity="0.5" />

    <!-- Mouth -->
    <path d="M17 22 Q20 24.5 23 22" stroke="#7c2d12" stroke-width="1" stroke-linecap="round" fill="none" />

    <!-- Blush cheeks -->
    <ellipse cx="11" cy="21" rx="2.2" ry="1.1" fill="#f472b6" opacity="0.35" />
    <ellipse cx="29" cy="21" rx="2.2" ry="1.1" fill="#f472b6" opacity="0.35" />
  </svg>
</template>
