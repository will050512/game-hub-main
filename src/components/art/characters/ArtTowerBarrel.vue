<script setup lang="ts">
defineProps<{ size?: number; bodyColor?: string; inkColor?: string }>()
</script>

<template>
  <svg
    :width="size ?? 48"
    :height="size ?? 16"
    viewBox="0 0 48 16"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Steel barrel body gradient (metallic) -->
      <linearGradient id="barrel-body" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#a8b8c8" />
        <stop offset="15%" stop-color="#8898a8" />
        <stop offset="40%" stop-color="#5a6a7a" />
        <stop offset="70%" stop-color="#3a4a5a" />
        <stop offset="100%" stop-color="#2a3a4a" />
      </linearGradient>

      <!-- Chrome highlight (top strip) -->
      <linearGradient id="chrome-stripe" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e8f0f8" />
        <stop offset="50%" stop-color="#c0d0e0" />
        <stop offset="100%" stop-color="#90a0b0" />
      </linearGradient>

      <!-- Glossy top reflection -->
      <linearGradient id="barrel-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
        <stop offset="30%" stop-color="#ffffff" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Barrel cap gradient -->
      <linearGradient id="barrel-cap" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#b8c4d0" />
        <stop offset="50%" stop-color="#7a8a9a" />
        <stop offset="100%" stop-color="#4a5a6a" />
      </linearGradient>

      <!-- Rim metallic gradient -->
      <linearGradient id="barrel-rim-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#c8d4e0" />
        <stop offset="30%" stop-color="#a0b0c0" />
        <stop offset="100%" stop-color="#5a6a7a" />
      </linearGradient>

      <!-- Rim dark edge -->
      <linearGradient id="rim-dark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3a4a5a" />
        <stop offset="100%" stop-color="#1a2a3a" />
      </linearGradient>

      <!-- Drop shadow -->
      <filter id="barrel-shadow" x="-10%" y="-20%" width="120%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#1a2030" flood-opacity="0.25" />
      </filter>

      <!-- Barrel curvature highlight -->
      <linearGradient id="barrel-curve-hl" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
        <stop offset="15%" stop-color="#ffffff" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- End cap metallic -->
      <linearGradient id="end-cap" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c8d4e0" />
        <stop offset="50%" stop-color="#7a8a9a" />
        <stop offset="100%" stop-color="#4a5a6a" />
      </linearGradient>

      <!-- Inner shadow -->
      <radialGradient id="barrel-inner" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Shadow underneath -->
    <rect x="6" y="13" width="34" height="2.5" rx="1" fill="#1a2030" opacity="0.1" />

    <!-- Barrel cap (right end) -->
    <path d="M40 2 H46 V14 H40 Z" fill="url(#barrel-cap)" stroke="#2a3a4a" stroke-width="1.2" stroke-linejoin="round" />

    <!-- Cap edge highlight -->
    <path d="M40 2 H46 V14 H40 Z" fill="url(#barrel-gloss)" />

    <!-- Cap top rim -->
    <rect x="40" y="2" width="6" height="1.5" rx="0.5" fill="url(#chrome-stripe)" />

    <!-- Barrel end circle -->
    <circle cx="46" cy="8" r="3" fill="url(#end-cap)" stroke="#2a3a4a" stroke-width="1" />
    <circle cx="46" cy="8" r="3" fill="url(#barrel-gloss)" />

    <!-- Barrel end rim -->
    <circle cx="46" cy="8" r="1.2" fill="#5a6a7a" stroke="#2a3a4a" stroke-width="0.6" />

    <!-- Main barrel body -->
    <rect x="6" y="4" width="34" height="8" rx="3.5" fill="url(#barrel-body)" stroke="#2a3a4a" stroke-width="1.2" filter="url(#barrel-shadow)" />

    <!-- Barrel top glossy strip -->
    <rect x="6" y="4" width="34" height="2.5" rx="3.5" fill="url(#chrome-stripe)" opacity="0.3" />

    <!-- Gloss overlay on body -->
    <rect x="6" y="4" width="34" height="8" rx="3.5" fill="url(#barrel-gloss)" />

    <!-- Curved highlight (top reflection line) -->
    <rect x="10" y="4.5" width="26" height="1" rx="0.5" fill="#ffffff" opacity="0.2" />

    <!-- Barrel stripe bands -->
    <rect x="12" y="3" width="2" height="10" rx="0.5" fill="url(#barrel-rim-grad)" stroke="#2a3a4a" stroke-width="0.4" />
    <rect x="34" y="3" width="2" height="10" rx="0.5" fill="url(#barrel-rim-grad)" stroke="#2a3a4a" stroke-width="0.4" />

    <!-- Rim details -->
    <circle cx="6" cy="8" r="2" fill="url(#barrel-rim-grad)" stroke="#2a3a4a" stroke-width="0.8" />
    <circle cx="40" cy="8" r="2" fill="url(#barrel-rim-grad)" stroke="#2a3a4a" stroke-width="0.8" />

    <!-- Rivet/bolt details -->
    <circle cx="13" cy="8" r="1" fill="#6a7a8a" stroke="#2a3a4a" stroke-width="0.4" />
    <circle cx="35" cy="8" r="1" fill="#6a7a8a" stroke="#2a3a4a" stroke-width="0.4" />

    <!-- Eyes -->
    <circle cx="18" cy="7" r="2" fill="#1a2030" stroke="#3a4a5a" stroke-width="0.5" />
    <circle cx="30" cy="7" r="2" fill="#1a2030" stroke="#3a4a5a" stroke-width="0.5" />

    <!-- Eye highlights -->
    <circle cx="18.7" cy="6.3" r="0.5" fill="#ffffff" />
    <circle cx="30.7" cy="6.3" r="0.5" fill="#ffffff" />

    <!-- Blush -->
    <ellipse cx="13" cy="11" rx="1.5" ry="0.6" fill="#ff8866" opacity="0.25" />
    <ellipse cx="35" cy="11" rx="1.5" ry="0.6" fill="#ff8866" opacity="0.25" />

    <!-- Mouth -->
    <path d="M20 10 Q22 12 24 10" stroke="#2a3a4a" stroke-width="0.8" stroke-linecap="round" fill="none" />

    <!-- Metal grain texture lines -->
    <line x1="22" y1="5" x2="22" y2="11" stroke="#ffffff" stroke-width="0.3" opacity="0.1" />
    <line x1="26" y1="5" x2="26" y2="11" stroke="#ffffff" stroke-width="0.3" opacity="0.08" />
    <line x1="30" y1="5" x2="30" y2="11" stroke="#ffffff" stroke-width="0.3" opacity="0.06" />
  </svg>
</template>
