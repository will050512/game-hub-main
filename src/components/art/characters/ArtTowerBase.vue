<script setup lang="ts">
defineProps<{ size?: number; bodyColor?: string; inkColor?: string }>()
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
      <!-- Stone body gradient (lighter at top, darker at bottom) -->
      <linearGradient id="tower-base-body" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#c0c7d0" />
        <stop offset="20%" stop-color="#9aa5b2" />
        <stop offset="60%" stop-color="#6b7a8a" />
        <stop offset="100%" stop-color="#4a5a6a" />
      </linearGradient>

      <!-- Dome top gradient -->
      <linearGradient id="tower-dome-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#b8c4d0" />
        <stop offset="40%" stop-color="#8a99a9" />
        <stop offset="100%" stop-color="#5a6a7a" />
      </linearGradient>

      <!-- Stone highlight (left side gloss) -->
      <linearGradient id="tower-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
        <stop offset="35%" stop-color="#ffffff" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Window glow -->
      <radialGradient id="window-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffcc44" stop-opacity="0.9" />
        <stop offset="40%" stop-color="#ff9922" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#884400" stop-opacity="0.15" />
      </radialGradient>

      <!-- Window glow bloom -->
      <radialGradient id="window-bloom" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffdd66" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffaa33" stop-opacity="0" />
      </radialGradient>

      <!-- Shadow filter -->
      <filter id="tower-base-shadow" x="-15%" y="-10%" width="130%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#1a2030" flood-opacity="0.3" />
      </filter>

      <!-- Bevel highlight -->
      <linearGradient id="tower-bevel-left" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Tier step gradient -->
      <linearGradient id="tower-tier-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#a8b4c2" />
        <stop offset="100%" stop-color="#7a8a9a" />
      </linearGradient>

      <!-- Base ground shadow -->
      <radialGradient id="base-ground-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1a2030" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#1a2030" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Ground shadow -->
    <ellipse cx="28" cy="50" rx="22" ry="5" fill="url(#base-ground-shadow)" />

    <!-- Shadow cast underneath -->
    <path d="M10 46 H46 L46 48 H10 Z" fill="#1a2030" opacity="0.1" />

    <!-- Main body (rectangular base) -->
    <rect x="10" y="28" width="36" height="18" rx="4" fill="url(#tower-base-body)" stroke="#2a3a4a" stroke-width="1.5" filter="url(#tower-base-shadow)" />

    <!-- Body left gloss -->
    <rect x="10" y="28" width="36" height="18" rx="4" fill="url(#tower-gloss)" />

    <!-- Left edge bevel highlight -->
    <rect x="10" y="28" width="3" height="18" rx="1.5" fill="#ffffff" opacity="0.12" />

    <!-- Dome/tower top -->
    <path d="M10 28 Q28 10 46 28" fill="url(#tower-dome-grad)" stroke="#2a3a4a" stroke-width="1.5" stroke-linejoin="round" />

    <!-- Dome gloss overlay -->
    <path d="M10 28 Q28 10 46 28" fill="url(#tower-gloss)" />

    <!-- Dome left bevel -->
    <path d="M10 28 Q18 20 26 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.18" />

    <!-- Tiered structure - upper band -->
    <rect x="12" y="24" width="32" height="4" rx="1.5" fill="url(#tower-tier-grad)" stroke="#2a3a4a" stroke-width="1" />
    <rect x="12" y="24" width="32" height="1.5" rx="0.75" fill="#ffffff" opacity="0.1" />

    <!-- Tiered structure - lower band -->
    <rect x="10" y="42" width="36" height="3" rx="1" fill="url(#tower-tier-grad)" stroke="#2a3a4a" stroke-width="1" />

    <!-- Stone texture lines -->
    <path d="M14 32 H18 M38 32 H42 M28 34 H32 M14 38 H18 M38 38 H42 M28 40 H32" stroke="#3a4a5a" stroke-width="0.6" stroke-linecap="round" opacity="0.4" />

    <!-- Central window/slot with glow -->
    <rect x="22" y="32" width="12" height="8" rx="2" fill="#1a2030" stroke="#3a4a5a" stroke-width="1" />
    <rect x="22" y="32" width="12" height="8" rx="2" fill="url(#window-glow)" />

    <!-- Window bloom effect -->
    <rect x="19" y="29" width="18" height="14" rx="4" fill="url(#window-bloom)" opacity="0.6" />

    <!-- Eyes -->
    <circle cx="22" cy="34" r="3" fill="#1a2030" stroke="#2a3a4a" stroke-width="0.6" />
    <circle cx="34" cy="34" r="3" fill="#1a2030" stroke="#2a3a4a" stroke-width="0.6" />

    <!-- Eye highlights -->
    <circle cx="23" cy="33" r="0.9" fill="#ffffff" />
    <circle cx="35" cy="33" r="0.9" fill="#window" />

    <!-- Blush -->
    <ellipse cx="17" cy="39" rx="2.5" ry="1.2" fill="#ff8866" opacity="0.25" />
    <ellipse cx="39" cy="39" rx="2.5" ry="1.2" fill="#ff8866" opacity="0.25" />

    <!-- Mouth -->
    <path d="M24 39 Q28 42 32 39" stroke="#2a3a4a" stroke-width="1.2" stroke-linecap="round" fill="none" />

    <!-- Stone detail lines on dome -->
    <path d="M16 22 Q20 16 26 13" stroke="#2a3a4a" stroke-width="0.8" fill="none" opacity="0.3" />
    <path d="M40 22 Q36 16 30 13" stroke="#2a3a4a" stroke-width="0.8" fill="none" opacity="0.3" />
    <path d="M24 15 Q28 12 32 15" stroke="#2a3a4a" stroke-width="0.8" fill="none" opacity="0.25" />

    <!-- Corner edge highlights -->
    <path d="M12 28 L12 42 M44 28 L44 42" stroke="#ffffff" stroke-width="0.6" opacity="0.08" />
  </svg>
</template>
