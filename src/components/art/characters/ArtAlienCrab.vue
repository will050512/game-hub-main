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
      <!-- Metallic shell gradient: copper → bronze → gold -->
      <linearGradient id="crabShell" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="35%" stop-color="#f59e0b" />
        <stop offset="65%" stop-color="#b45309" />
        <stop offset="100%" stop-color="#78350f" />
      </linearGradient>
      <!-- Shell top highlight -->
      <linearGradient id="crabSheen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="45%" stop-color="#ffffff" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <!-- Pincer gradient -->
      <linearGradient id="pincerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#92400e" />
      </linearGradient>
      <!-- Glowing red eyes -->
      <filter id="crabEyeGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <!-- Shadow -->
      <filter id="crabShadow" x="-15%" y="-5%" width="130%" height="130%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#451a03" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Main shell with metallic gradient -->
    <path d="M8 15 Q11 6 20 6 Q29 6 32 15 L29 25 Q20 31 11 25 Z" fill="url(#crabShell)" stroke="#451a03" stroke-width="1.4" stroke-linejoin="round" filter="url(#crabShadow)" />

    <!-- Glossy sheen on upper-left -->
    <path d="M10 14 Q20 7 30 14 L28 17 Q20 13 12 17 Z" fill="url(#crabSheen)" />

    <!-- Shell texture / segment lines -->
    <path d="M12 18 Q20 14 28 18" stroke="#78350f" stroke-width="0.7" stroke-linecap="round" fill="none" opacity="0.5" />
    <path d="M11 21 Q20 17 29 21" stroke="#78350f" stroke-width="0.7" stroke-linecap="round" fill="none" opacity="0.4" />
    <path d="M14 24 Q20 21 26 24" stroke="#78350f" stroke-width="0.7" stroke-linecap="round" fill="none" opacity="0.35" />

    <!-- Center shell ridge -->
    <path d="M20 9 L20 23" stroke="#92400e" stroke-width="0.6" stroke-linecap="round" fill="none" opacity="0.3" />

    <!-- Left pincer arm -->
    <path d="M9 16 L2 12 Q1 11 2 10 L5 8 Q7 7 8 10 L9 13" fill="url(#pincerGrad)" stroke="#78350f" stroke-width="1" stroke-linejoin="round" />
    <!-- Right pincer arm -->
    <path d="M31 16 L38 12 Q39 11 38 10 L35 8 Q33 7 32 10 L31 13" fill="url(#pincerGrad)" stroke="#78350f" stroke-width="1" stroke-linejoin="round" />

    <!-- Pinner tips -->
    <circle cx="1.5" cy="9" r="1.2" fill="#fbbf24" stroke="#78350f" stroke-width="0.6" />
    <circle cx="38.5" cy="9" r="1.2" fill="#fbbf24" stroke="#78350f" stroke-width="0.6" />

    <!-- Legs -->
    <path d="M12 24 L6 29 M28 24 L34 29 M14 26 L10 31 M26 26 L30 31" stroke="#92400e" stroke-width="1.3" stroke-linecap="round" />

    <!-- Eyes - glowing red -->
    <circle cx="15" cy="17" r="3" fill="#450a0a" stroke="#ef4444" stroke-width="1" filter="url(#crabEyeGlow)" />
    <circle cx="25" cy="17" r="3" fill="#450a0a" stroke="#ef4444" stroke-width="1" filter="url(#crabEyeGlow)" />
    <circle cx="16" cy="16" r="1" fill="#ffffff" />
    <circle cx="26" cy="16" r="1" fill="#ffffff" />

    <!-- Blush cheeks -->
    <ellipse cx="10" cy="21" rx="2.3" ry="1.1" fill="#f59e0b" opacity="0.25" />
    <ellipse cx="30" cy="21" rx="2.3" ry="1.1" fill="#f59e0b" opacity="0.25" />

    <!-- Mouth -->
    <path d="M16 22 Q20 25 24 22" stroke="#451a03" stroke-width="1" stroke-linecap="round" fill="none" />
  </svg>
</template>
