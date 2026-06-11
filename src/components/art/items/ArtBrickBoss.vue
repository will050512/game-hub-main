<!--
  ArtBrickBoss — Gold-accented 3D boss brick with decorative pattern and eyes.
-->
<script setup lang="ts">
defineProps<{ width?: number; height?: number }>()
</script>

<template>
  <svg
    :width="width ?? 96"
    :height="height ?? 48"
    viewBox="0 0 96 48"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="bossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f97316" stop-opacity="1" />
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.5" />
        <stop offset="20%" stop-color="#dc2626" stop-opacity="1" />
        <stop offset="50%" stop-color="#b91c1c" />
        <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0.9" />
      </linearGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fde68a" stop-opacity="0.9" />
        <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fde68a" stop-opacity="0.9" />
      </linearGradient>
      <linearGradient id="bossHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.4" />
      </linearGradient>
      <filter id="bossGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <radialGradient id="bossFaceShadow" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
      </radialGradient>
    </defs>

    <rect x="1" y="2" width="94" height="44" rx="12" fill="#fbbf24" opacity="0.12" filter="url(#bossGlow)" />
    <rect x="3" y="4" width="90" height="40" rx="10" fill="url(#bossGrad)" stroke="url(#goldBorder)" stroke-width="2.5" />
    <path d="M12 10 H84" stroke="url(#bossHighlight)" stroke-width="2.5" stroke-linecap="round" />
    <path d="M12 40 H84" stroke="#000000" stroke-width="1.5" stroke-linecap="round" opacity="0.2" />
    <rect x="8" y="14" width="80" height="22" rx="6" fill="url(#bossFaceShadow)" />

    <path d="M6 18 L14 18 M6 18 L6 26" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
    <path d="M90 18 L82 18 M90 18 L90 26" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
    <path d="M6 30 L14 30 M6 30 L6 22" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
    <path d="M90 30 L82 30 M90 30 L90 22" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />

    <path d="M24 22 L38 18" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round" />
    <path d="M72 22 L58 18" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round" />

    <ellipse cx="31" cy="28" rx="5.5" ry="4.5" fill="#ffffff" stroke="#1a1a1a" stroke-width="1.4" />
    <ellipse cx="65" cy="28" rx="5.5" ry="4.5" fill="#ffffff" stroke="#1a1a1a" stroke-width="1.4" />

    <circle cx="28" cy="28" r="2" fill="#1a1a1a" />
    <circle cx="68" cy="28" r="2" fill="#1a1a1a" />

    <path d="M30 35 Q38 38 48 34 Q48 38 58 34 Q68 38 76 35" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" fill="none" />

    <path d="M48 10 L52 14 L48 18 L44 14 Z" fill="#fbbf24" opacity="0.6" />
  </svg>
</template>
