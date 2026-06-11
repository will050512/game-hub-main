<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 64"
    :height="size ?? 36"
    viewBox="0 0 64 36"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Metallic hull gradient: silver → steel blue -->
      <linearGradient id="shipHull" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e2e8f0" />
        <stop offset="30%" stop-color="#94a3b8" />
        <stop offset="65%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#0e7490" />
      </linearGradient>
      <!-- Cockpit glass gradient -->
      <linearGradient id="cockpitGlass" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#cffafe" />
        <stop offset="100%" stop-color="#22d3ee" />
      </linearGradient>
      <!-- Engine glow radial gradient -->
      <radialGradient id="engineGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.95" />
        <stop offset="40%" stop-color="#f97316" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
      </radialGradient>
      <!-- Wing edge gradient -->
      <linearGradient id="wingEdge" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#818cf8" />
      </linearGradient>
      <!-- Glossy highlight gradient -->
      <linearGradient id="hullHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <!-- Drop shadow filter -->
      <filter id="shipShadow" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.35" />
      </filter>
      <!-- Engine glow filter -->
      <filter id="engineGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <!-- Cyan glow for eyes -->
      <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Engine glow at rear -->
    <ellipse cx="32" cy="30" rx="10" ry="6" fill="url(#engineGlow)" filter="url(#engineGlowFilter)" opacity="0.85" />

    <!-- Wing left -->
    <path d="M13 23 L3 17 Q1 15 4 14 L13 18" fill="url(#wingEdge)" stroke="#0e7490" stroke-width="0.8" stroke-linejoin="round" />
    <!-- Wing right -->
    <path d="M51 23 L61 17 Q63 15 60 14 L51 18" fill="url(#wingEdge)" stroke="#0e7490" stroke-width="0.8" stroke-linejoin="round" />

    <!-- Main hull body -->
    <path d="M13 21 Q22 8 32 8 Q42 8 51 21 L58 27 Q32 34 6 27 Z" fill="url(#shipHull)" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round" />

    <!-- Glossy top highlight (left-side sheen) -->
    <path d="M15 19 Q24 9 32 9 Q40 9 49 19 L46 15 Q38 11 32 11 Q26 11 18 15 Z" fill="url(#hullHighlight)" opacity="0.6" />

    <!-- Cockpit window -->
    <path d="M23 14 Q32 6 41 14 L39 20 Q32 17 25 20 Z" fill="url(#cockpitGlass)" stroke="#0891b2" stroke-width="0.8" />

    <!-- Glass reflection on cockpit -->
    <path d="M26 13 Q30 9 34 12" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7" />

    <!-- Shadow beneath ship -->
    <ellipse cx="32" cy="33" rx="22" ry="3" fill="#0f172a" opacity="0.2" />

    <!-- Eyes (cyan glow) -->
    <circle cx="24" cy="21" r="4" fill="#083344" stroke="#0ea5e9" stroke-width="1" filter="url(#eyeGlow)" />
    <circle cx="40" cy="21" r="4" fill="#083344" stroke="#0ea5e9" stroke-width="1" filter="url(#eyeGlow)" />
    <circle cx="25.2" cy="19.8" r="1.3" fill="#ffffff" />
    <circle cx="41.2" cy="19.8" r="1.3" fill="#ffffff" />

    <!-- Wing accent glow -->
    <ellipse cx="15" cy="25" rx="3.5" ry="1.8" fill="#38bdf8" opacity="0.45" />
    <ellipse cx="49" cy="25" rx="3.5" ry="1.8" fill="#818cf8" opacity="0.45" />

    <!-- Hull detail line -->
    <path d="M27 25 Q32 28 37 25" stroke="#0c4a6e" stroke-width="1.2" stroke-linecap="round" fill="none" />
  </svg>
</template>
