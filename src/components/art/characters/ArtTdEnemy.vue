<script setup lang="ts">
defineProps<{ size?: number; bodyColor?: string; inkColor?: string }>()
</script>

<template>
  <svg
    :width="size ?? 28"
    :height="size ?? 28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Body gradient (default red, can be overridden) -->
      <linearGradient id="enemy-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f06060" />
        <stop offset="30%" stop-color="#d43535" />
        <stop offset="70%" stop-color="#b02020" />
        <stop offset="100%" stop-color="#8a1515" />
      </linearGradient>

      <!-- Armor plate gradient (metallic) -->
      <linearGradient id="armor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#c8d8e8" />
        <stop offset="30%" stop-color="#8a9aa8" />
        <stop offset="70%" stop-color="#5a6a7a" />
        <stop offset="100%" stop-color="#3a4a5a" />
      </linearGradient>

      <!-- Armor top gloss -->
      <linearGradient id="armor-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Shield plate metallic -->
      <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e0e8f0" />
        <stop offset="50%" stop-color="#7888a0" />
        <stop offset="100%" stop-color="#4a5a6a" />
      </linearGradient>

      <!-- Shield gloss -->
      <linearGradient id="shield-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Visor glow -->
      <radialGradient id="eye-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff8833" stop-opacity="1" />
        <stop offset="50%" stop-color="#ff4400" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#cc2200" stop-opacity="0.3" />
      </radialGradient>

      <!-- Eye glow bloom -->
      <radialGradient id="eye-bloom" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff6622" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#ff6622" stop-opacity="0" />
      </radialGradient>

      <!-- Helmet crest gradient -->
      <linearGradient id="crest-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8a040" />
        <stop offset="50%" stop-color="#d06020" />
        <stop offset="100%" stop-color="#903010" />
      </linearGradient>

      <!-- Drop shadow filter -->
      <filter id="enemy-shadow" x="-15%" y="-10%" width="130%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#1a0a0a" flood-opacity="0.25" />
      </filter>

      <!-- Body gloss overlay -->
      <linearGradient id="body-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2" />
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Underbelly shadow -->
      <radialGradient id="belly-shadow" cx="50%" cy="80%" r="60%">
        <stop offset="0%" stop-color="#2a0a0a" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#2a0a0a" stop-opacity="0" />
      </radialGradient>

      <!-- Body shadow overlay -->
      <radialGradient id="body-inner-shadow" cx="30%" cy="20%" r="80%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.1" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="100%" stop-color="#0a0000" stop-opacity="0.3" />
      </radialGradient>
    </defs>

    <!-- Shadow cast -->
    <ellipse cx="14" cy="26" rx="10" ry="3" fill="#1a0a0a" opacity="0.15" />

    <!-- Body (armored egg shape) -->
    <ellipse cx="14" cy="15" rx="10" ry="9" fill="url(#enemy-body-grad)" stroke="#3a1a1a" stroke-width="1.4" filter="url(#enemy-shadow)" />

    <!-- Body gloss overlay -->
    <ellipse cx="14" cy="15" rx="10" ry="9" fill="url(#body-gloss)" />

    <!-- Body inner shadow -->
    <ellipse cx="14" cy="15" rx="10" ry="9" fill="url(#body-inner-shadow)" />

    <!-- Belly shadow -->
    <ellipse cx="14" cy="20" rx="8" ry="5" fill="url(#belly-shadow)" />

    <!-- Helmet/armor dome (top) -->
    <path d="M4 12 L14 3 L24 12" fill="url(#armor-grad)" stroke="#3a4a5a" stroke-width="1.2" stroke-linejoin="round" />

    <!-- Armor dome gloss -->
    <path d="M4 12 L14 3 L24 12" fill="url(#armor-gloss)" />

    <!-- Armor left bevel highlight -->
    <path d="M5 11 Q10 6 14 5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.25" />

    <!-- Crest/spike on top -->
    <path d="M14 3 Q12 0 10 1 Q14 -1 18 0 Q16 1 14 3" fill="url(#crest-grad)" stroke="#5a3010" stroke-width="0.8" stroke-linejoin="round" />
    <path d="M13 2 Q12 0 11 1" stroke="#ffcc66" stroke-width="0.5" stroke-linecap="round" fill="none" opacity="0.5" />

    <!-- Armor plates (chevron pattern on face) -->
    <path d="M20 12 L26 15 L20 18" fill="url(#shield-grad)" stroke="#2a3a4a" stroke-width="1" stroke-linejoin="round" />
    <path d="M20 12 L26 15 L20 18" fill="url(#shield-gloss)" />

    <!-- Armor plate left chevron -->
    <path d="M8 12 L14 15 L8 18" fill="url(#armor-grad)" stroke="#3a4a5a" stroke-width="1" stroke-linejoin="round" opacity="0.6" />

    <!-- Visor/mask area -->
    <path d="M6 12 L22 12 L20 15 L8 15 Z" fill="#2a1a1a" stroke="#4a2a2a" stroke-width="0.6" stroke-linejoin="round" />

    <!-- Visor top edge highlight -->
    <line x1="6" y1="12" x2="22" y2="12" stroke="#664444" stroke-width="0.6" stroke-linecap="round" />

    <!-- Glowing eyes (warm orange-red) -->
    <circle cx="15" cy="13" r="2.4" fill="url(#eye-glow)" />
    <circle cx="21" cy="13" r="2.4" fill="url(#eye-glow)" />

    <!-- Eye glow bloom effect -->
    <circle cx="15" cy="13" r="4.5" fill="url(#eye-bloom)" opacity="0.6" />
    <circle cx="21" cy="13" r="4.5" fill="url(#eye-bloom)" opacity="0.6" />

    <!-- Eye pupils -->
    <circle cx="15.5" cy="13" r="1.2" fill="#1a0a0a" />
    <circle cx="21.5" cy="13" r="1.2" fill="#1a0a0a" />

    <!-- Eye highlight dots -->
    <circle cx="14.7" cy="12.3" r="0.6" fill="#ffffff" opacity="0.7" />
    <circle cx="20.7" cy="12.3" r="0.6" fill="#ffffff" opacity="0.7" />

    <!-- Mouth/mandible line -->
    <path d="M11 18 L14 20 L17 18" stroke="#3a1a1a" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <!-- Mouth teeth detail -->
    <path d="M13 18 L13.5 19.5" stroke="#cc8866" stroke-width="0.8" stroke-linecap="round" />
    <path d="M15 18 L14.5 19.5" stroke="#cc8866" stroke-width="0.8" stroke-linecap="round" />

    <!-- Armor detail lines -->
    <path d="M8 14 L8 16 M20 14 L20 16" stroke="#2a3a4a" stroke-width="0.6" stroke-linecap="round" opacity="0.4" />

    <!-- Body texture lines -->
    <path d="M6 20 Q14 23 22 20" stroke="#6a2020" stroke-width="0.6" fill="none" opacity="0.3" />
    <path d="M8 22 Q14 24 20 22" stroke="#6a2020" stroke-width="0.5" fill="none" opacity="0.2" />

    <!-- Exoskeleton seam lines -->
    <path d="M14 12 L14 18" stroke="#4a1a1a" stroke-width="0.5" stroke-linecap="round" opacity="0.3" />
    <path d="M10 12 Q12 15 10 18" stroke="#4a1a1a" stroke-width="0.5" stroke-linecap="round" opacity="0.2" />
    <path d="M18 12 Q16 15 18 18" stroke="#4a1a1a" stroke-width="0.5" stroke-linecap="round" opacity="0.2" />
  </svg>
</template>
