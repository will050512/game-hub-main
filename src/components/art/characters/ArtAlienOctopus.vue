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
      <!-- Body gradient: teal → deep blue bioluminescent -->
      <linearGradient id="octoBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#2dd4bf" />
        <stop offset="50%" stop-color="#0891b2" />
        <stop offset="100%" stop-color="#1e3a5f" />
      </linearGradient>
      <!-- Body sheen (top-left gloss) -->
      <linearGradient id="octoSheen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="35%" stop-color="#ffffff" stop-opacity="0.06" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <!-- Tentacle gradient -->
      <linearGradient id="tentacleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#06b6d4" />
        <stop offset="100%" stop-color="#0e7490" stop-opacity="0.25" />
      </linearGradient>
      <!-- Bioluminescent spot gradient -->
      <radialGradient id="bioSpot" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#4ade80" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
      </radialGradient>
      <!-- Green eye glow -->
      <filter id="octoEyeGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <!-- Body ambient glow -->
      <filter id="octoGlow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <!-- Drop shadow -->
      <filter id="octoShadow" x="-15%" y="-5%" width="130%" height="130%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#083344" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Ambient body glow -->
    <path d="M8 17 Q8 5 20 4 Q32 5 32 17 L30 25 Q24 29 20 25 Q16 29 10 25 Z" fill="#0e7490" opacity="0.2" filter="url(#octoGlow)" />

    <!-- Main body -->
    <path d="M8 17 Q8 7 20 6 Q32 7 32 17 L30 25 Q24 29 20 25 Q16 28 10 25 Z" fill="url(#octoBody)" stroke="#164e63" stroke-width="1.4" stroke-linejoin="round" filter="url(#octoShadow)" />

    <!-- Glossy top sheen -->
    <path d="M10 15 Q15 9 20 8 Q25 9 30 15 L28 18 Q22 14 20 14 Q18 14 12 18 Z" fill="url(#octoSheen)" />

    <!-- Body segment lines (3D shading) -->
    <path d="M10 19 Q20 16 30 19" stroke="#155e75" stroke-width="0.7" stroke-linecap="round" fill="none" opacity="0.4" />
    <path d="M10 22 Q20 19 30 22" stroke="#155e75" stroke-width="0.7" stroke-linecap="round" fill="none" opacity="0.3" />

    <!-- Bioluminescent spots on body -->
    <circle cx="13" cy="16" r="1.5" fill="url(#bioSpot)" opacity="0.7" />
    <circle cx="27" cy="16" r="1.5" fill="url(#bioSpot)" opacity="0.7" />
    <circle cx="20" cy="14" r="1.8" fill="url(#bioSpot)" opacity="0.6" />
    <circle cx="16" cy="20" r="1" fill="#4ade80" opacity="0.4" />
    <circle cx="24" cy="20" r="1" fill="#4ade80" opacity="0.4" />
    <circle cx="20" cy="24" r="0.9" fill="#4ade80" opacity="0.35" />

    <!-- Eyes - glowing bright green -->
    <circle cx="15" cy="17" r="3" fill="#052e16" stroke="#4ade80" stroke-width="1" filter="url(#octoEyeGlow)" />
    <circle cx="25" cy="17" r="3" fill="#052e16" stroke="#4ade80" stroke-width="1" filter="url(#octoEyeGlow)" />
    <circle cx="16" cy="16" r="1" fill="#ffffff" />
    <circle cx="26" cy="16" r="1" fill="#ffffff" />

    <!-- Tentacles -->
    <path d="M11 24 Q7 27 5 31" stroke="url(#tentacleGrad)" stroke-width="1.6" stroke-linecap="round" />
    <path d="M17 25 Q14 28 13 32" stroke="url(#tentacleGrad)" stroke-width="1.4" stroke-linecap="round" />
    <path d="M23 25 Q26 28 27 32" stroke="url(#tentacleGrad)" stroke-width="1.4" stroke-linecap="round" />
    <path d="M29 24 Q33 27 35 31" stroke="url(#tentacleGrad)" stroke-width="1.6" stroke-linecap="round" />

    <!-- Cheek blush -->
    <ellipse cx="11" cy="21" rx="2.3" ry="1.1" fill="#22d3ee" opacity="0.3" />
    <ellipse cx="29" cy="21" rx="2.3" ry="1.1" fill="#22d3ee" opacity="0.3" />

    <!-- Mouth -->
    <path d="M16 22 Q20 25 24 22" stroke="#164e63" stroke-width="1" stroke-linecap="round" fill="none" />
  </svg>
</template>
